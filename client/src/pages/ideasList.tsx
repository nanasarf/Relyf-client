import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  // CircularProgress,
  Alert,
  Stack,
  IconButton,
  Chip,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { useGetIdeasQuery, useSearchIdeasQuery } from "../services/ideasApi";
import { useToggleReactionMutation } from "../services/reactionsApi";
import { useToggleSaveMutation } from "../services/savesApi";
import { useToasts } from "../context/ToastsContext";

export default function IdeasList() {
  const navigate = useNavigate();
  const { showToast } = useToasts();
  const [searchQuery, setSearchQuery] = useState("");
  const [skip, setSkip] = useState(0);
  const take = 12;

  // Fetch ideas
  const ideasQuery = useGetIdeasQuery(searchQuery ? undefined : { skip, take });
  const searchQuery_ = useSearchIdeasQuery(
    { query: searchQuery, skip, take },
    { skip: !searchQuery }
  );

  const ideasData = searchQuery ? searchQuery_.data : ideasQuery.data;
  const ideas = ideasData?.results ?? [];
  const total = ideasData?.total ?? 0;
  const isLoading = searchQuery ? searchQuery_.isLoading : ideasQuery.isLoading;
  const isError = searchQuery ? searchQuery_.isError : ideasQuery.isError;

  // Mutations
  const [toggleReaction] = useToggleReactionMutation();
  const [toggleSave] = useToggleSaveMutation();

  // State for like/save toggles (optimistic UI)
  const [liked, setLiked] = useState<Set<string | number>>(new Set());
  const [saved, setSaved] = useState<Set<string | number>>(new Set());

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSkip(0);
  };

  const handleLike = async (ideaId: string | number) => {
    try {
      setLiked((prev) => new Set(prev).add(ideaId));
      await toggleReaction({ ideaId, type: "like" }).unwrap();
    } catch {
      setLiked((prev) => {
        const next = new Set(prev);
        next.delete(ideaId);
        return next;
      });
      showToast("Failed to toggle like", "error");
    }
  };

  const handleSave = async (ideaId: string | number) => {
    try {
      setSaved((prev) => new Set(prev).add(ideaId));
      await toggleSave({ ideaId }).unwrap();
    } catch {
      setSaved((prev) => {
        const next = new Set(prev);
        next.delete(ideaId);
        return next;
      });
      showToast("Failed to toggle save", "error");
    }
  };

  const currentPage = Math.floor(skip / take) + 1;
  const hasMore = skip + take < total;

  const skeletons = Array.from({ length: 6 });

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4">Ideas</Typography>
        <Button variant="contained" onClick={() => navigate("/ideas/generate")}>
          Generate Idea
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3, display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Search ideas…"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Status Messages */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load ideas. Please try again.
        </Alert>
      )}

      {isLoading && (
        <Stack spacing={2}>
          {skeletons.map((_, i) => (
            <Card key={i}>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="80%" />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Skeleton variant="rounded" width={50} height={24} />
                  <Skeleton variant="rounded" width={60} height={24} />
                  <Skeleton variant="rounded" width={40} height={24} />
                </Stack>
              </CardContent>
              <CardActions>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}

      {/* Ideas Grid */}
      {!isLoading && Array.isArray(ideas) && ideas.length === 0 && (
        <Alert severity="info" sx={{ my: 4 }}>
          No ideas match your search. Try adjusting the prompt or exploring
          generated ones.
        </Alert>
      )}

      {!isLoading && Array.isArray(ideas) && ideas.length > 0 && (
        <Stack spacing={2}>
          {ideas.map((idea) => (
            <Card
              key={idea.id}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate(`/ideas/${idea.id}`)}
            >
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                  {idea.title || "Untitled"}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    mb: 1,
                  }}
                >
                  {idea.description || "No description"}
                </Typography>
                {idea.tags && idea.tags.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", gap: 1 }}
                  >
                    {idea.tags.slice(0, 3).map((tag: string) => {
                      const color: "primary" | "secondary" =
                        tag.length > 6 ? "secondary" : "primary";
                      return (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          color={color}
                          variant="outlined"
                        />
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
              <CardActions sx={{ pt: 0 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(idea.id);
                  }}
                >
                  {liked.has(idea.id) ? (
                    <FavoriteIcon color="error" fontSize="small" />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(idea.id);
                  }}
                >
                  {saved.has(idea.id) ? (
                    <BookmarkIcon color="primary" fontSize="small" />
                  ) : (
                    <BookmarkBorderIcon fontSize="small" />
                  )}
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {!isLoading && Array.isArray(ideas) && ideas.length > 0 && (
        <Box display="flex" justifyContent="center" gap={2} sx={{ mt: 4 }}>
          <Button
            disabled={skip === 0}
            onClick={() => setSkip(Math.max(0, skip - take))}
          >
            Previous
          </Button>
          <Typography alignSelf="center">Page {currentPage}</Typography>
          <Button disabled={!hasMore} onClick={() => setSkip(skip + take)}>
            Next
          </Button>
        </Box>
      )}
    </Container>
  );
}
