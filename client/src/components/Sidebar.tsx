import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  Divider,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { signOut } from "../features/auth/authSlice";
import { alpha } from "@mui/material/styles";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(signOut());
    navigate("/login");
  };

  const menuItems = [
    { label: "Home", icon: <HomeIcon />, path: "/" },
    { label: "Search Users", icon: <SearchIcon />, path: "/search-users" },
    { label: "Saved Ideas", icon: <BookmarkIcon />, path: "/saved" },
    { label: "Profile", icon: <PersonIcon />, path: "/profile" },
  ];

  const user = localStorage.getItem("relyf_user");
  const displayName = user ? JSON.parse(user).displayName || "User" : "User";

  return (
    <Box
      sx={(t) => ({
        width: 280,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        borderRight: t.custom?.glass?.border,
        background: t.custom?.glass?.bg,
        backdropFilter: "blur(20px)",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        p: 2,
        zIndex: 1200,
        boxShadow: t.custom?.glass?.shadow,
      })}
    >
      {/* Logo */}
      <Typography
        variant="h4"
        component={RouterLink}
        to="/"
        sx={{
          textDecoration: "none",
          background: (t) => t.custom?.gradients?.brand,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 800,
          mb: 4,
          mt: 2,
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: "-0.5px",
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      >
        Relyf
      </Typography>

      {/* Navigation */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: "4px",
                    background: (t) => t.custom?.gradients?.brand,
                    transform: isActive ? "scaleY(1)" : "scaleY(0)",
                    transition: "transform 0.3s ease",
                  },
                  "&.Mui-selected": {
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                    color: "primary.main",
                    fontWeight: 700,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.16),
                    },
                    "& .MuiListItemIcon-root": {
                      color: "primary.main",
                    },
                  },
                  "&:hover": {
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                    transform: "translateX(4px)",
                    "& .MuiListItemIcon-root": {
                      color: (t) => t.palette.primary.main,
                    },
                    "& .MuiListItemText-primary": {
                      color: (t) => t.palette.primary.main,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: (t) =>
                      isActive
                        ? t.palette.primary.main
                        : t.palette.text.secondary,
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.95rem",
                    color: isActive ? "primary.main" : undefined,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}

        {/* Create Button */}
        <ListItem disablePadding sx={{ mt: 2 }}>
          <ListItemButton
            component={RouterLink}
            to="/ideas"
            sx={(t) => ({
              borderRadius: 3,
              py: 1.5,
              background: t.custom?.gradients?.accent,
              color: "white",
              boxShadow: "0 4px 12px rgba(255, 167, 38, 0.3)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                background: t.custom?.gradients?.accent,
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(255, 167, 38, 0.4)",
              },
              "&:active": {
                transform: "translateY(0px)",
              },
            })}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
              <AddCircleOutlineIcon />
            </ListItemIcon>
            <ListItemText
              primary="Create"
              primaryTypographyProps={{
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* User Section */}
      <Divider sx={{ mb: 2 }} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          px: 1,
          cursor: "pointer",
          borderRadius: 2,
          p: 1,
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: "rgba(67, 160, 71, 0.05)",
            transform: "translateX(2px)",
          },
        }}
      >
        <Avatar
          sx={(t) => ({
            background: t.custom?.gradients?.brand,
            width: 40,
            height: 40,
            boxShadow: "0 2px 8px rgba(67, 160, 71, 0.3)",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
            },
          })}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ ml: 1.5, flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            View Profile
          </Typography>
        </Box>
      </Box>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="outlined"
        startIcon={<LogoutIcon />}
        fullWidth
        sx={{
          borderRadius: 3,
          textTransform: "none",
          fontWeight: 500,
          borderColor: "primary.main",
          color: "primary.main",
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "rgba(67, 160, 71, 0.05)",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(67, 160, 71, 0.15)",
          },
        }}
      >
        Logout
      </Button>
    </Box>
  );
}
