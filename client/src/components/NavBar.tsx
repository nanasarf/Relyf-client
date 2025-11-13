import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Box, Tabs, Tab } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { signOut } from "../features/auth/authSlice";
import { useEffect, useState } from "react";

export default function NavBar() {
  const token = useAppSelector((s) => s.auth.token);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(signOut());
    navigate("/login");
  };

  const location = useLocation();
  const tabMap: Record<string, number> = {
    "/": 0,
    "/explore": 1,
    "/ideas": 2,
    "/saved": 3,
    "/search-users": 4,
    "/profile": 5,
  };
  const current =
    Object.keys(tabMap).find((p) => location.pathname.startsWith(p)) ?? "/";
  const value = tabMap[current];

  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={(t) => ({
        background: t.custom?.glass?.bg || "rgba(255,255,255,0.75)",
        backdropFilter: elevated ? "blur(16px)" : "blur(10px)",
        borderBottom: t.custom?.glass?.border,
        boxShadow: elevated
          ? "0 8px 24px rgba(31, 41, 55, 0.12)"
          : t.custom?.glass?.shadow,
        transition: "box-shadow 200ms ease, backdrop-filter 200ms ease",
      })}
    >
      <Toolbar sx={{ gap: 3 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: 800,
            background: (t) => t.custom?.gradients?.brand,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.25px",
          }}
        >
          Relyf
        </Typography>
        {token && (
          <Tabs
            value={value}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              flexGrow: 1,
            }}
          >
            <Tab label="Home" component={RouterLink} to="/" />
            <Tab label="Explore" component={RouterLink} to="/explore" />
            <Tab label="Ideas" component={RouterLink} to="/ideas" />
            <Tab label="Saved" component={RouterLink} to="/saved" />
            <Tab
              label="Search"
              icon={<SearchIcon />}
              iconPosition="start"
              component={RouterLink}
              to="/search-users"
            />
            <Tab label="Profile" component={RouterLink} to="/profile" />
          </Tabs>
        )}
        <Box sx={{ ml: "auto", display: "flex", gap: 2, alignItems: "center" }}>
          {token ? (
            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              sx={{
                borderRadius: 999,
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              component={RouterLink}
              to="/login"
              sx={{ borderRadius: 999 }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
