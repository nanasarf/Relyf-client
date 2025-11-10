import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  IconButton,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import type { Project } from "../types/projects";

interface ProjectCardProps {
  project?: Project; // if undefined, show skeleton
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  if (!project) {
    return (
      <Card variant="outlined" sx={{ width: 320 }}>
        <CardContent>
          <Skeleton variant="text" width={180} />
          <Skeleton variant="text" width={240} />
          <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{ width: 320, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
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
        {project.steps && project.steps.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            {project.steps.length} step{project.steps.length === 1 ? "" : "s"}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton size="small" aria-label="likes" disabled>
            <FavoriteBorderIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="comments" disabled>
            <ChatBubbleOutlineIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="saves" disabled>
            <BookmarkBorderIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}

export function ProjectCardSkeleton() {
  return <ProjectCard />;
}
