// src/pages/Home.tsx
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Avatar,
  CircularProgress,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { useGetUserFollowingQuery } from "../services/usersApi";
import { useGetFeedProjectsQuery } from "../services/projectsApi";

export default function Home() {
  const navigate = useNavigate();

  // Get current user ID
  const currentUserId = localStorage.getItem("relyf_user")
    ? JSON.parse(localStorage.getItem("relyf_user")!).id
    : null;

  // Get list of users the current user is following
  const { data: following } = useGetUserFollowingQuery(currentUserId || "", {
    skip: !currentUserId,
  });

  // Get feed projects using RTK Query
  const { data: feedItems = [], isLoading: isLoadingFeed } =
    useGetFeedProjectsQuery();

  // Helper to build absolute image URL (mirrors logic in ProjectCard)
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://localhost:5101";
  const getImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) {
      // lightweight inline SVG placeholder (same as ProjectCard)
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect fill='%23f5f5f5' width='640' height='360'/%3E%3Ctext fill='%23bdbdbd' font-family='Arial, sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%93%B7 No image%3C/text%3E%3C/svg%3E";
    }
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    const baseUrl = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;
    const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
    return `${baseUrl}${path}`;
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFA" }}>
      {/* Hero Section */}
      <Box
        sx={(t) => ({
          background:
            t.custom?.gradients?.hero ||
            "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
          color: "white",
          py: { xs: 6, md: 8 },
          px: 3,
          mb: 4,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 50%)",
          },
        })}
      >
        <Box
          sx={{ maxWidth: 1200, mx: "auto", position: "relative", zIndex: 1 }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mb: 2,
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <BookmarkIcon sx={{ fontSize: 40 }} />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2rem", md: "2.5rem" },
                  }}
                >
                  Your Feed
                </Typography>
              </Stack>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.95,
                  fontWeight: 400,
                  mb: 3,
                  maxWidth: 500,
                  mx: { xs: "auto", md: 0 },
                }}
              >
                {following && following.length > 0
                  ? `Discover projects from ${following.length} ${
                      following.length === 1 ? "person" : "people"
                    } you follow`
                  : "Start following creators to see their projects"}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ justifyContent: { xs: "center", md: "flex-start" } }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/ideas")}
                  startIcon={<AutoAwesomeIcon />}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.95)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Generate Ideas
                </Button>
                {(!following || following.length === 0) && (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/search-users")}
                    startIcon={<PersonIcon />}
                    sx={{
                      borderColor: "white",
                      color: "white",
                      textTransform: "none",
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Find Creators
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Stats Display */}
            {following && following.length > 0 && (
              <Box
                sx={(t) => ({
                  bgcolor: t.custom?.glass?.bg || "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: t.custom?.glass?.border,
                  boxShadow: t.custom?.glass?.shadow,
                  borderRadius: 3,
                  p: 3,
                  minWidth: 200,
                })}
              >
                <Stack spacing={2}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h3" fontWeight={800}>
                      {feedItems.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Ideas in Feed
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" fontWeight={700}>
                      {following.length}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Following
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3, pb: 6 }}>
        {isLoadingFeed ? (
          <Box sx={{ textAlign: "center", py: 12 }}>
            <CircularProgress size={60} thickness={4} />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mt: 3, fontWeight: 500 }}
            >
              Loading your personalized feed...
            </Typography>
          </Box>
        ) : feedItems.length === 0 ? (
          <Card
            sx={{
              textAlign: "center",
              py: 10,
              px: 4,
              borderRadius: 4,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              background: "white",
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                bgcolor: "rgba(67, 160, 71, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 64, color: "primary.main" }} />
            </Box>
            <Typography
              variant="h4"
              fontWeight={700}
              color="text.primary"
              gutterBottom
            >
              Your feed is waiting
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 500, mx: "auto" }}
            >
              {following && following.length > 0
                ? "The people you follow haven't posted any projects yet. Check back soon!"
                : "Follow creative minds to see their projects!"}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/search-users")}
              startIcon={<PersonIcon />}
              sx={{
                background: "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
                textTransform: "none",
                fontWeight: 700,
                px: 5,
                py: 1.5,
                boxShadow: "0 4px 14px rgba(67, 160, 71, 0.3)",
              }}
            >
              Find Creators to Follow
            </Button>
          </Card>
        ) : (
          <>
            {/* Feed Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Latest Projects
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feedItems.length}{" "}
                {feedItems.length === 1 ? "project" : "projects"} from people
                you follow
              </Typography>
            </Box>

            {/* Feed Grid */}
            <Stack spacing={3}>
              {feedItems.map((item) => (
                <Card
                  key={`project-${item.projectId}`}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    border: "1px solid",
                    borderColor: "rgba(0,0,0,0.08)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: "0 12px 32px rgba(67, 160, 71, 0.15)",
                      transform: "translateY(-4px)",
                      borderColor: "rgba(67, 160, 71, 0.3)",
                    },
                  }}
                  onClick={() => navigate(`/projects/${item.projectId}`)}
                >
                  {/* Card Header */}
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
                      p: 3,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Avatar
                        src={item._userInfo?.avatarUrl}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "white",
                          color: "primary.main",
                          cursor: "pointer",
                          border: "3px solid rgba(255,255,255,0.3)",
                          transition: "transform 0.2s ease",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/users/${item.userId}`);
                        }}
                      >
                        {item._userInfo?.displayName?.[0]?.toUpperCase() ||
                          item._userInfo?.userName?.[0]?.toUpperCase() ||
                          "?"}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,0.85)",
                            cursor: "pointer",
                            fontWeight: 500,
                            "&:hover": { color: "white" },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/users/${item.userId}`);
                          }}
                        >
                          {item._userInfo?.displayName ||
                            item._userInfo?.userName}{" "}
                          posted a project
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.7)" }}
                        >
                          {new Date(item.createdAtUtc).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{ color: "white", letterSpacing: "-0.5px" }}
                    >
                      {item.title}
                    </Typography>
                  </Box>

                  {/* Card Content */}
                  <CardContent sx={{ p: 3 }}>
                    {/* Project Image */}
                    <Box
                      sx={{
                        mb: 3,
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor: "grey.100",
                        aspectRatio: "16 / 9",
                      }}
                    >
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        loading="lazy"
                      />
                    </Box>
                    {item.description && (
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          mb: 3,
                          lineHeight: 1.7,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}

                    {item.steps && item.steps.length > 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        {item.steps.length}{" "}
                        {item.steps.length === 1 ? "step" : "steps"}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>

            {/* Load More / Refresh */}
            {feedItems.length > 0 && (
              <Box sx={{ textAlign: "center", mt: 6 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  You're all caught up! 🎉
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
