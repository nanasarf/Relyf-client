import {
  useGetUserProfileQuery,
  useGetUserFollowersQuery,
  useGetUserFollowingQuery,
  useUpdateUserProfileMutation,
} from "../services/usersApi";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";

import { useGetMyProjectsQuery } from "../services/projectsApi";
import { ProjectCard } from "../components/ProjectCard";

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  // Edit Profile modal state
  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

  const currentUserId = localStorage.getItem("relyf_user")
    ? JSON.parse(localStorage.getItem("relyf_user")!).id
    : null;

  const { data: user, isLoading: userLoading } = useGetUserProfileQuery(
    currentUserId || "",
    { skip: !currentUserId }
  );
  const { data: followers } = useGetUserFollowersQuery(currentUserId || "", {
    skip: !currentUserId,
  });
  const { data: following } = useGetUserFollowingQuery(currentUserId || "", {
    skip: !currentUserId,
  });
  const { data: myProjects, isLoading: projectsLoading } =
    useGetMyProjectsQuery();

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
        <Typography variant="h5">Unable to load profile</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFA" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
                    {user.userName && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        @{user.userName}
                      </Typography>
                    )}
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
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setDisplayName(user.displayName || "");
                      setBio(user.bio || "");
                      setEditOpen(true);
                    }}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      textTransform: "none",
                      fontWeight: 600,
                      background:
                        "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
                      boxShadow: "0 4px 12px rgba(67, 160, 71, 0.3)",
                      "&:hover": {
                        boxShadow: "0 6px 16px rgba(67, 160, 71, 0.4)",
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                  {/* Edit Profile Modal */}
                  <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogContent>
                      <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                          label="Display Name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="Bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          fullWidth
                          multiline
                          minRows={2}
                        />
                      </Stack>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => setEditOpen(false)}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          await updateProfile({
                            id: currentUserId,
                            profile: {
                              displayName,
                              bio,
                            },
                          });
                          setEditOpen(false);
                        }}
                        variant="contained"
                        disabled={isUpdating}
                      >
                        Save
                      </Button>
                    </DialogActions>
                  </Dialog>
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
              <Box sx={{ cursor: "pointer" }} onClick={() => setActiveTab(1)}>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {user.followerCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Followers
                </Typography>
              </Box>
              <Box sx={{ cursor: "pointer" }} onClick={() => setActiveTab(2)}>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {user.followingCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Following
                </Typography>
              </Box>
              <Box sx={{ cursor: "pointer" }} onClick={() => setActiveTab(0)}>
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
            <Tab label={`Projects (${myProjects?.results?.length || 0})`} />
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
            ) : myProjects?.results && myProjects.results.length > 0 ? (
              <Stack spacing={3}>
                {myProjects.results.map((project) => (
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
                  Create your first project from the Ideas page
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
