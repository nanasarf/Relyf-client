import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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

  return (
    <AppBar
      color="transparent"
      elevation={0}
      position="static"
      sx={{ borderBottom: "1px solid #eee" }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Relyf
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button component={RouterLink} to="/">
            Home
          </Button>
          {token ? (
            <Button variant="contained" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="contained" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
