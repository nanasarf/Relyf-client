import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  IconButton,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  CardMedia,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import {
  useCreateProjectMutation,
  useUpsertStepsMutation,
} from "../services/projectsApi";
import { useUploadImageMutation } from "../services/imagesApi";
import { useToasts } from "../context/ToastsContext";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { baseApi } from "../services/baseApi";

interface PostProjectDialogProps {
  open: boolean;
  onClose: () => void;
  ideaTitle: string;
  ideaSteps: string;
  ideaTools: string;
  ideaSafety: string;
  aiIdeaId?: number | null; // Optional: ID of AI-generated idea from database
}

export default function PostProjectDialog({
  open,
  onClose,
  ideaTitle,
  ideaSteps,
  ideaTools,
  ideaSafety,
  aiIdeaId, // Keep prop for future use after DB migration
}: PostProjectDialogProps) {
  const { showToast } = useToasts();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [upsertSteps] = useUpsertStepsMutation();
  const [uploadImage] = useUploadImageMutation();

  // Suppress unused warning - will be used after DB migration
  void aiIdeaId;

  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      showToast("Please select a valid image (JPEG, PNG, or WebP)", "error");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast("Image size must be less than 5MB", "error");
      return;
    }

    setSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      showToast("Please add a caption for your project", "warning");
      return;
    }

    if (!user?.id) {
      showToast("You must be logged in to post a project", "error");
      return;
    }

    try {
      // Format steps from AI content
      const stepsArray = ideaSteps
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Step 1: Create the project (without steps)
      const projectData: {
        userId: number;
        title: string;
        description: string;
        ideaId?: number | null;
        // aiIdeaId?: number | null; // TODO: Uncomment after backend adds AiIdeaId column to database
      } = {
        userId: parseInt(user.id),
        title: ideaTitle,
        description: caption,
        // aiIdeaId: aiIdeaId || null, // TODO: Uncomment after DB migration
      };

      console.log("Creating project with data:", projectData);
      const result = await createProject(projectData).unwrap();
      console.log("Project created:", result);
      console.log(
        "Project imageUrl from creation:",
        result.imageUrl || "NO IMAGE URL"
      );

      // Step 2: Add steps to the project
      if (stepsArray.length > 0) {
        console.log("Adding steps to project:", result.projectId);
        await upsertSteps({
          id: result.projectId,
          steps: stepsArray,
        }).unwrap();
      }

      // Step 3: Upload image if selected
      if (selectedImage) {
        setUploadingImage(true);
        try {
          console.log("Uploading image to project:", result.projectId);
          const uploadResult = await uploadImage({
            file: selectedImage,
            ownerId: result.projectId,
            ownerType: "Project",
          }).unwrap();
          console.log("Image uploaded successfully:", uploadResult);
          showToast("Image uploaded successfully!", "success");
        } catch (imgError) {
          console.error("Image upload failed:", imgError);
          showToast(
            "Project posted but image upload failed. You can add images later.",
            "warning"
          );
        } finally {
          setUploadingImage(false);
        }
      }

      showToast("Project posted successfully! 🎉", "success");

      // Force refetch of projects to show updated imageUrl
      dispatch(
        baseApi.util.invalidateTags([
          { type: "Projects", id: "LIST" },
          { type: "Projects", id: "FEED" },
          { type: "Project", id: result.projectId },
        ])
      );

      // Reset form
      setCaption("");
      setSelectedImage(null);
      setImagePreview(null);

      // Small delay to ensure cache invalidation completes
      await new Promise((resolve) => setTimeout(resolve, 500));

      onClose();
    } catch (error) {
      console.error("Failed to post project:", error);

      // Better error handling
      let errorMessage = "Failed to post project. Please try again.";

      if (error && typeof error === "object") {
        const err = error as Record<string, unknown>;

        // Log the full error details for debugging
        console.error("Full error details:", JSON.stringify(err, null, 2));

        // Check for SQL/Database errors
        if (
          err.data &&
          typeof err.data === "string" &&
          err.data.includes("SqlException")
        ) {
          errorMessage =
            "Database error on server. Please contact support or try again later.";
        } else if (err.status === 500) {
          // Check if there's error details in the response
          if (err.data && typeof err.data === "object") {
            const data = err.data as Record<string, unknown>;
            if (data.error && typeof data.error === "string") {
              errorMessage = `Server error: ${data.error}`;
            }
            if (data.message && typeof data.message === "string") {
              errorMessage = `Server error: ${data.message}`;
            }
            // Log the full error data for debugging
            console.error("Server error data:", data);
          } else {
            errorMessage = "Server error occurred. Please try again later.";
          }
        } else if (err.status === 401) {
          errorMessage = "You must be logged in to post a project.";
        } else if (
          err.data &&
          typeof err.data === "object" &&
          err.data !== null
        ) {
          const data = err.data as Record<string, unknown>;
          if (data.message && typeof data.message === "string") {
            errorMessage = data.message;
          }
        } else if (err.error) {
          errorMessage = String(err.error);
        }
      }

      showToast(errorMessage, "error");
    }
  };
  const isSubmitting = isCreating;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Post This Project
            </Typography>
          </Stack>
          <IconButton
            onClick={onClose}
            disabled={isSubmitting}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Share your completed project with the community
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={3}>
          {/* Caption Section */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              gutterBottom
              sx={{ mb: 1.5 }}
            >
              Caption *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Share your experience creating this project... What challenges did you face? What would you do differently?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isSubmitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {caption.length} / 500 characters
            </Typography>
          </Box>

          {/* Image Upload Section */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              gutterBottom
              sx={{ mb: 1.5 }}
            >
              Project Image
            </Typography>

            {imagePreview ? (
              // Image Preview
              <Card
                sx={{
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "2px solid",
                  borderColor: "primary.light",
                }}
              >
                <CardMedia
                  component="img"
                  image={imagePreview}
                  alt="Project preview"
                  sx={{
                    maxHeight: 300,
                    objectFit: "contain",
                    bgcolor: "grey.100",
                  }}
                />
                <IconButton
                  onClick={handleRemoveImage}
                  disabled={isSubmitting || uploadingImage}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 1)",
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Card>
            ) : (
              // Upload Button
              <Box>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                  id="project-image-upload"
                  disabled={isSubmitting || uploadingImage}
                />
                <label htmlFor="project-image-upload">
                  <Button
                    component="span"
                    fullWidth
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    disabled={isSubmitting || uploadingImage}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      borderStyle: "dashed",
                      borderWidth: 2,
                      textTransform: "none",
                      "&:hover": {
                        borderStyle: "dashed",
                        borderWidth: 2,
                      },
                    }}
                  >
                    <Stack alignItems="center" spacing={0.5}>
                      <ImageIcon
                        sx={{ fontSize: 32, color: "text.secondary" }}
                      />
                      <Typography variant="body2" fontWeight={600}>
                        Click to upload project image
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        JPEG, PNG, or WebP (max 5MB)
                      </Typography>
                    </Stack>
                  </Button>
                </label>
              </Box>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              💡 Add a photo of your finished project to inspire others!
            </Typography>
          </Box>

          {/* AI Steps Preview */}
          <Card
            sx={{
              bgcolor: "rgba(67, 160, 71, 0.05)",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "primary.light",
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <AutoAwesomeIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    AI Steps (Included in Post)
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ py: 0.5 }}>
                  <Typography variant="caption">
                    The AI-generated steps will be automatically included in
                    your project post to help others recreate it.
                  </Typography>
                </Alert>

                {/* Project Title */}
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ textTransform: "uppercase" }}
                  >
                    Project Title
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {ideaTitle}
                  </Typography>
                </Box>

                {/* Tools */}
                {ideaTools && (
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                      sx={{ textTransform: "uppercase" }}
                    >
                      Tools & Materials
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mt: 0.5, whiteSpace: "pre-line" }}
                    >
                      {ideaTools}
                    </Typography>
                  </Box>
                )}

                {/* Steps */}
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ textTransform: "uppercase" }}
                  >
                    Steps
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      whiteSpace: "pre-line",
                      maxHeight: 150,
                      overflow: "auto",
                    }}
                  >
                    {ideaSteps}
                  </Typography>
                </Box>

                {/* Safety */}
                {ideaSafety && (
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                      sx={{ textTransform: "uppercase" }}
                    >
                      Safety Notes
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mt: 0.5, whiteSpace: "pre-line" }}
                    >
                      {ideaSafety}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !caption.trim()}
          variant="contained"
          sx={{ borderRadius: 2, minWidth: 120 }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Post Project"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
