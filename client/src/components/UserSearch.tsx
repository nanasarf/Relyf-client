// src/components/UserSearch.tsx
import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useLazySearchUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../services/usersApi";

export default function UserSearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerSearch, { data, isLoading, isFetching }] =
    useLazySearchUsersQuery();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const currentUserId = localStorage.getItem("relyf_user")
    ? JSON.parse(localStorage.getItem("relyf_user")!).id
    : null;

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) return;

    const timer = setTimeout(() => {
      triggerSearch({ query: searchQuery, skip: 0, take: 20 });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, triggerSearch]);

  // Debug: Log search results
  useEffect(() => {
    if (data) {
      console.log("Search results:", data.results);
      data.results.forEach((user) => {
        console.log(
          `User ${user.userName}: isFollowing=${user.isFollowing}, isFollowedBy=${user.isFollowedBy}`
        );
      });
    }
  }, [data]);

  const handleFollow = async (userId: number | string) => {
    try {
      await followUser({ followingId: userId }).unwrap();
      // Re-trigger search to update follow status
      if (searchQuery.trim()) {
        triggerSearch({ query: searchQuery, skip: 0, take: 20 });
      }
    } catch (error) {
      console.error("Failed to follow user:", error);
      // Handle 409 Conflict - already following
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 409
      ) {
        // Already following - refresh to get correct status
        if (searchQuery.trim()) {
          triggerSearch({ query: searchQuery, skip: 0, take: 20 });
        }
      }
    }
  };

  const handleUnfollow = async (userId: number | string) => {
    try {
      await unfollowUser(userId).unwrap();
      // Re-trigger search to update follow status
      if (searchQuery.trim()) {
        triggerSearch({ query: searchQuery, skip: 0, take: 20 });
      }
    } catch (error) {
      console.error("Failed to unfollow user:", error);
      // Handle 404 - not following
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 404
      ) {
        // Not following - refresh to get correct status
        if (searchQuery.trim()) {
          triggerSearch({ query: searchQuery, skip: 0, take: 20 });
        }
      }
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
      <TextField
        fullWidth
        placeholder="Search for users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (isLoading || isFetching) && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        }}
      />

      {data && data.results.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            mt: 2,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <List sx={{ py: 0 }}>
            {data.results.map((user) => (
              <ListItem
                key={user.id}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": { borderBottom: "none" },
                  "&:hover": { bgcolor: "grey.50" },
                  cursor: "pointer",
                }}
                secondaryAction={
                  user.id !== currentUserId && (
                    <Button
                      variant={user.isFollowing ? "outlined" : "contained"}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (user.isFollowing) {
                          handleUnfollow(user.id);
                        } else {
                          handleFollow(user.id);
                        }
                      }}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        minWidth: 100,
                      }}
                    >
                      {user.isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )
                }
              >
                <ListItemAvatar onClick={() => navigate(`/users/${user.id}`)}>
                  <Avatar src={user.avatarUrl} sx={{ bgcolor: "primary.main" }}>
                    {user.displayName?.[0]?.toUpperCase() || <PersonIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  onClick={() => navigate(`/users/${user.id}`)}
                  primary={
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user.displayName || user.userName || "User"}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      {user.bio && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {user.bio}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled">
                        {user.followerCount || 0} followers •{" "}
                        {user.projectCount || 0} projects •{" "}
                        {user.saveCount || 0} saves
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {data && data.results.length === 0 && searchQuery.trim().length >= 2 && (
        <Paper
          elevation={1}
          sx={{
            mt: 2,
            p: 4,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <PersonIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No users found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Try a different search term
          </Typography>
        </Paper>
      )}

      {!data && searchQuery.trim().length < 2 && (
        <Paper
          elevation={1}
          sx={{
            mt: 2,
            p: 4,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <SearchIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Search for users
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Enter at least 2 characters to search
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
