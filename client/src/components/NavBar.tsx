import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Box, Tabs, Tab } from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { signOut } from "../features/auth/authSlice";

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
    "/ideas": 1,
    "/ideas/generate": 2,
    "/saved": 3,
    "/profile": 4,
  };
  const current =
    Object.keys(tabMap).find((p) => location.pathname.startsWith(p)) ?? "/";
  const value = tabMap[current];

  return (
    <AppBar color="default" position="sticky" elevation={1}>
      <Toolbar sx={{ gap: 3 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ textDecoration: "none", color: "inherit", fontWeight: 700 }}
        >
          Relyf
        </Typography>
        {token && (
          <Tabs
            value={value}
            textColor="primary"
            indicatorColor="primary"
            sx={{ flexGrow: 1 }}
          >
            <Tab label="Home" component={RouterLink} to="/" />
            <Tab label="Ideas" component={RouterLink} to="/ideas" />
            <Tab label="Generate" component={RouterLink} to="/ideas/generate" />
            <Tab label="Saved" component={RouterLink} to="/saved" />
            <Tab label="Profile" component={RouterLink} to="/profile" />
          </Tabs>
        )}
        <Box sx={{ ml: "auto", display: "flex", gap: 2 }}>
          {token ? (
            <Button variant="outlined" size="small" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              component={RouterLink}
              to="/login"
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
