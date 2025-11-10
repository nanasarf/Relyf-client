import { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  IconButton,
  Chip,
  Dialog,
  TextField,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useGetIdeaByIdQuery,
  useGetIdeaStatsQuery,
} from "../services/ideasApi";
import { useToggleReactionMutation } from "../services/reactionsApi";
import { useToggleSaveMutation } from "../services/savesApi";
import {
  useUploadImageMutation,
  useGetImagesByOwnerQuery,
  useDeleteImageMutation,
} from "../services/imagesApi";
import {
  useGetAllTagsQuery,
  useAttachTagToIdeaMutation,
} from "../services/tagsApi";
import { useToasts } from "../context/ToastsContext";

export default function IdeaDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToasts();

  // Queries
  const {
    data: idea,
    isLoading: ideaLoading,
    isError: ideaError,
  } = useGetIdeaByIdQuery(id);
  const { data: stats } = useGetIdeaStatsQuery(id, {
    skip: !id,
  });
  const { data: images = [], isLoading: imagesLoading } =
    useGetImagesByOwnerQuery({ ownerType: "Idea", ownerId: id }, { skip: !id });
  const { data: allTags = [] } = useGetAllTagsQuery();

  // Mutations
  const [toggleReaction] = useToggleReactionMutation();
  const [toggleSave] = useToggleSaveMutation();
  const [uploadImage] = useUploadImageMutation();
  const [deleteImage] = useDeleteImageMutation();
  const [attachTag] = useAttachTagToIdeaMutation();

  // Local state
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openTagDialog, setOpenTagDialog] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | number | null>(
    null
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleLike = async () => {
    try {
      setLiked(!liked);
      await toggleReaction({ ideaId: id, type: "like" }).unwrap();
    } catch {
      setLiked(!liked);
      showToast("Failed to toggle like", "error");
    }
  };

  const handleSave = async () => {
    try {
      setSaved(!saved);
      await toggleSave({ ideaId: id }).unwrap();
    } catch {
      setSaved(!saved);
      showToast("Failed to toggle save", "error");
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      await uploadImage({ file, ownerId: id, ownerType: "Idea" }).unwrap();
      showToast("Image uploaded successfully!", "success");
    } catch {
      showToast("Failed to upload image", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: string | number) => {
    try {
      await deleteImage(imageId).unwrap();
      showToast("Image deleted", "success");
    } catch {
      showToast("Failed to delete image", "error");
    }
  };

  const handleAttachTag = async () => {
    if (!selectedTagId) return;
    try {
      await attachTag({ ideaId: id, tagId: selectedTagId }).unwrap();
      showToast("Tag attached!", "success");
      setOpenTagDialog(false);
      setSelectedTagId(null);
    } catch {
      showToast("Failed to attach tag", "error");
    }
  };

  if (ideaLoading) {
    return (
      <Container sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (ideaError || !idea) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Failed to load idea</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/ideas")}>
          Back to Ideas
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => navigate("/ideas")} sx={{ mb: 2 }}>
          ← Back to Ideas
        </Button>
        <Typography variant="h4" gutterBottom>
          {idea.title ?? "(no title)"}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Created by {idea.userName ?? idea.displayName ?? "Anonymous"}
        </Typography>
      </Box>

      {/* Main Content */}
      <Stack spacing={3}>
        {/* Description */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body2">
              {idea.description || "No description"}
            </Typography>
          </CardContent>
        </Card>

        {/* Stats */}
        {stats && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stats
              </Typography>
              <Stack direction="row" spacing={2}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Views
                  </Typography>
                  <Typography variant="h6">{stats.views ?? 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Saves
                  </Typography>
                  <Typography variant="h6">{stats.saves ?? 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Reactions
                  </Typography>
                  <Typography variant="h6">{stats.reactions ?? 0}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Engagement */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Engagement
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                onClick={handleLike}
                color={liked ? "error" : "default"}
              >
                {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton
                size="small"
                onClick={handleSave}
                color={saved ? "primary" : "default"}
              >
                {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            </Stack>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Images
            </Typography>
            {imagesLoading ? (
              <CircularProgress size={24} />
            ) : images.length > 0 ? (
              <Stack spacing={1}>
                {images.map((img) => (
                  <Box
                    key={img.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1,
                      border: "1px solid #eee",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {img.url || `Image #${img.id}`}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteImage(img.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No images yet
              </Typography>
            )}

            {/* Upload Button */}
            <Box sx={{ mt: 2 }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUploadImage}
                style={{ display: "none" }}
                id="image-upload"
                disabled={uploadingImage}
              />
              <label htmlFor="image-upload">
                <Button
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploadingImage}
                  variant="outlined"
                >
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </Button>
              </label>
            </Box>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="h6">Tags</Typography>
              <Button size="small" onClick={() => setOpenTagDialog(true)}>
                Attach Tag
              </Button>
            </Box>
            {idea.tags && idea.tags.length > 0 ? (
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", gap: 1 }}
              >
                {idea.tags.map((tag: string) => (
                  <Chip key={tag} label={tag} />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No tags yet
              </Typography>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Attach Tag Dialog */}
      <Dialog open={openTagDialog} onClose={() => setOpenTagDialog(false)}>
        <Box sx={{ p: 3, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            Attach a Tag
          </Typography>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Select tag"
              value={selectedTagId ?? ""}
              onChange={(e) => setSelectedTagId(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">-- Select --</option>
              {allTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </TextField>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => setOpenTagDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAttachTag}
                disabled={!selectedTagId}
              >
                Attach
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </Container>
  );
}
