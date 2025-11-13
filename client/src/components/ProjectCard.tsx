import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Project } from "../types/projects";
import { useDeleteProjectMutation } from "../services/projectsApi";
import { useToasts } from "../context/ToastsContext";
import { useAppSelector } from "../app/hooks";

// Get API base URL for constructing absolute image URLs
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:5101";

interface ProjectCardProps {
  project?: Project; // if undefined, show skeleton
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { showToast } = useToasts();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!project) {
    return (
      <Card variant="outlined" sx={{ width: 320 }}>
        <Skeleton variant="rectangular" height={200} />
        <CardContent>
          <Skeleton variant="text" width={180} />
          <Skeleton variant="text" width={240} />
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Construct absolute image URL
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;

    // If already absolute URL, use as-is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // If relative URL, prepend API base URL
    const baseUrl = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;
    const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
    return `${baseUrl}${path}`;
  };

  const absoluteImageUrl = getImageUrl(project.imageUrl);

  // Debug logging
  if (project.imageUrl) {
    console.log("🖼️ ProjectCard Image Debug:", {
      projectId: project.projectId,
      rawImageUrl: project.imageUrl,
      absoluteImageUrl,
      apiBaseUrl: API_BASE_URL,
    });
  }

  // Check if current user owns this project
  const isOwner =
    currentUser?.id && project.userId === parseInt(currentUser.id);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log("Attempting to delete project:", project.projectId);
      await deleteProject(project.projectId).unwrap();
      showToast("Project deleted successfully! ✨", "success");
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete project:", error);
      const err = error as { status?: number; data?: unknown };
      
      if (err.status === 405) {
        showToast(
          "Delete feature not yet available. The backend needs to implement DELETE /api/Projects/{id}",
          "error"
        );
      } else if (err.status === 404) {
        showToast("Project not found. It may have already been deleted.", "warning");
        setDeleteDialogOpen(false);
      } else if (err.status === 401 || err.status === 403) {
        showToast("You don't have permission to delete this project.", "error");
      } else {
        showToast(
          `Failed to delete project (Error ${err.status || 'Unknown'}). Please try again.`,
          "error"
        );
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          width: 320,
          cursor: onClick ? "pointer" : "default",
          position: "relative",
        }}
        onClick={onClick}
      >
        {/* Menu button for owner */}
        {isOwner && (
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              "&:hover": {
                bgcolor: "white",
              },
              zIndex: 1,
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}

        {/* Always show image area - either actual image or placeholder */}
        <CardMedia
          component="img"
          height="200"
          image={
            absoluteImageUrl ||
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='200'%3E%3Crect fill='%23f5f5f5' width='320' height='200'/%3E%3Ctext fill='%23bdbdbd' font-family='Arial, sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%93%B7 No image%3C/text%3E%3C/svg%3E"
          }
          alt={project.title}
          sx={{
            objectFit: "cover",
            bgcolor: absoluteImageUrl ? "transparent" : "grey.100",
          }}
        />
        <CardContent>
          <Typography variant="h6" noWrap>
            {project.title}
          </Typography>
          {project.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
              noWrap
            >
              {project.description}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" aria-label="likes" disabled>
                {project.isLiked ? (
                  <FavoriteIcon fontSize="small" color="error" />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
              </IconButton>
              {project.likeCount !== undefined && project.likeCount > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {project.likeCount}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" aria-label="comments" disabled>
                <ChatBubbleOutlineIcon fontSize="small" />
              </IconButton>
              {project.commentCount !== undefined &&
                project.commentCount > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {project.commentCount}
                  </Typography>
                )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" aria-label="saves" disabled>
                {project.isSaved ? (
                  <BookmarkIcon fontSize="small" color="primary" />
                ) : (
                  <BookmarkBorderIcon fontSize="small" />
                )}
              </IconButton>
              {project.saveCount !== undefined && project.saveCount > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {project.saveCount}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Project</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{project.title}"? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={
              isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />
            }
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function ProjectCardSkeleton() {
  return <ProjectCard />;
}
