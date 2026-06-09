// src/pages/UserProfile.tsx
import {
  Avatar,
  Box,
  Container,
  Stack,
  Typography,
  Button,
  Card,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  useGetUserProfileQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetUserFollowersQuery,
  useGetUserFollowingQuery,
} from "../services/usersApi";
import { useGetUserProjectsQuery } from "../services/projectsApi";
import { ProjectCard } from "../components/ProjectCard";

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const currentUserId = localStorage.getItem("relyf_user")
    ? JSON.parse(localStorage.getItem("relyf_user")!).id
    : null;

  const { data: user, isLoading: userLoading } = useGetUserProfileQuery(
    id || "",
    { skip: !id },
  );
  const { data: followers } = useGetUserFollowersQuery(id || "", { skip: !id });
  const { data: following } = useGetUserFollowingQuery(id || "", { skip: !id });
  const { data: userProjectsData, isLoading: projectsLoading } =
    useGetUserProjectsQuery(
      { userId: id || "", skip: 0, take: 20 },
      { skip: !id },
    );
  const userProjects = userProjectsData?.results || [];

  const [followUser, { isLoading: followLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowLoading }] =
    useUnfollowUserMutation();

  const handleFollowToggle = async () => {
    if (!id) return;
    try {
      if (user?.isFollowing) {
        await unfollowUser(id).unwrap();
      } else {
        await followUser({ followingId: id }).unwrap();
      }
    } catch {}
  };

  if (userLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5">User not found</Typography>
      </Box>
    );
  }

  const isOwnProfile = currentUserId && String(currentUserId) === String(id);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFA" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        {/* Profile Header Card */}
        <Card
          sx={{
            mb: 4,
            borderRadius: 4,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            overflow: "visible",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
              height: 120,
              position: "relative",
            }}
          />
          <Box sx={{ px: 4, pb: 4 }}>
            <Stack direction="row" spacing={3} sx={{ mt: -6 }}>
              {/* Avatar */}
              <Avatar
                src={user.avatarUrl}
                sx={{
                  width: 140,
                  height: 140,
                  border: "6px solid white",
                  fontSize: "3rem",
                  bgcolor: "primary.main",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {user.displayName?.[0]?.toUpperCase() || "U"}
              </Avatar>

              {/* Profile Info */}
              <Box sx={{ flexGrow: 1, pt: 8 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                      {user.displayName || user.userName || "User"}
                    </Typography>
                    {user.bio && (
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 2, maxWidth: 600 }}
                      >
                        {user.bio}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      color="primary.main"
                      fontWeight={600}
                    >
                      {user.countryCode && `🌍 ${user.countryCode}`}
                    </Typography>
                  </Box>
                  {!isOwnProfile && (
                    <Button
                      variant={user.isFollowing ? "outlined" : "contained"}
                      startIcon={
                        user.isFollowing ? (
                          <PersonRemoveIcon />
                        ) : (
                          <PersonAddIcon />
                        )
                      }
                      onClick={handleFollowToggle}
                      disabled={followLoading || unfollowLoading}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        textTransform: "none",
                        fontWeight: 600,
                        ...(user.isFollowing
                          ? {}
                          : {
                              background:
                                "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
                              boxShadow: "0 4px 12px rgba(67, 160, 71, 0.3)",
                              "&:hover": {
                                boxShadow: "0 6px 16px rgba(67, 160, 71, 0.4)",
                              },
                            }),
                      }}
                    >
                      {user.isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </Stack>
              </Box>
            </Stack>

            {/* Stats Row */}
            <Stack
              direction="row"
              spacing={6}
              sx={{
                mt: 4,
                pt: 3,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {user.followerCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Followers
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {user.followingCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Following
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {user.projectCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Projects
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Card>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              px: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Tab label={`Projects (${userProjectsData?.total || 0})`} />
            <Tab label={`Followers (${followers?.length || 0})`} />
            <Tab label={`Following (${following?.length || 0})`} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            {projectsLoading ? (
              <Card
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 3,
                }}
              >
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Loading projects...
                </Typography>
              </Card>
            ) : userProjects && userProjects.length > 0 ? (
              <Stack spacing={3}>
                {userProjects.map((project) => (
                  <ProjectCard key={project.projectId} project={project} />
                ))}
              </Stack>
            ) : (
              <Card
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 3,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No projects yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.disabled"
                  sx={{ mt: 1 }}
                >
                  This user hasn't posted any projects
                </Typography>
              </Card>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {followers && followers.length > 0 ? (
              <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Stack spacing={2} sx={{ p: 2 }}>
                  {followers.map((follower) => (
                    <Box
                      key={follower.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "grey.100" },
                      }}
                      onClick={() => navigate(`/users/${follower.id}`)}
                    >
                      <Avatar
                        src={follower.avatarUrl}
                        sx={{ bgcolor: "primary.main" }}
                      >
                        {follower.displayName?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {follower.displayName || follower.userName || "User"}
                        </Typography>
                        {follower.bio && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {follower.bio}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Card>
            ) : (
              <Card
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 3,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No followers yet
                </Typography>
              </Card>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            {following && following.length > 0 ? (
              <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Stack spacing={2} sx={{ p: 2 }}>
                  {following.map((followedUser) => (
                    <Box
                      key={followedUser.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "grey.100" },
                      }}
                      onClick={() => navigate(`/users/${followedUser.id}`)}
                    >
                      <Avatar
                        src={followedUser.avatarUrl}
                        sx={{ bgcolor: "primary.main" }}
                      >
                        {followedUser.displayName?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {followedUser.displayName ||
                            followedUser.userName ||
                            "User"}
                        </Typography>
                        {followedUser.bio && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {followedUser.bio}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Card>
            ) : (
              <Card
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 3,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Not following anyone yet
                </Typography>
              </Card>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
