import {
  Container,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { useGetRecentLogsQuery } from "../services/adminApi";
import type { AdminLog } from "../services/adminApi";
import { useAppSelector } from "../app/hooks";
import { Link as RouterLink } from "react-router-dom";

export default function Home() {
  const token = useAppSelector((s) => s.auth.token);
  const { data, isLoading, error } = useGetRecentLogsQuery(undefined, {
    skip: !token,
  });

  if (!token) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>
          Home
        </Typography>
        <Alert severity="info" sx={{ my: 2 }}>
          You must be logged in to view admin logs.
        </Alert>
        <Button component={RouterLink} to="/login" variant="contained">
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Home
      </Typography>
      <Typography gutterBottom>Protected data below (requires JWT).</Typography>

      {isLoading && <Typography>Loading logs…</Typography>}
      {error && (
        <Alert severity="error">
          Failed to load logs. Check Network tab for details.
        </Alert>
      )}

      {Array.isArray(data) && (
        <List>
          {data.map((item: AdminLog, idx: number) => (
            <ListItem key={idx} divider>
              <ListItemText
                primary={item.message ?? JSON.stringify(item)}
                secondary={item.timestamp ?? ""}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}
