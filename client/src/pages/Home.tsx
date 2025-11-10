// src/pages/Home.tsx
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Alert,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  useGetLogsSummaryQuery,
  useGetTopModelsQuery,
  useGetRecentLogsQuery,
} from "../services/adminApi";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const user = localStorage.getItem("relyf_user");
  const displayName = user ? JSON.parse(user).displayName || "User" : "User";

  const summary = useGetLogsSummaryQuery();
  const topModels = useGetTopModelsQuery();
  const recent = useGetRecentLogsQuery();

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {displayName}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Relyf helps you discover creative ways to upcycle items.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          mb: 4,
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
        }}
      >
        {summary.isLoading ? (
          <CircularProgress size={32} sx={{ gridColumn: "1/-1", mx: "auto" }} />
        ) : summary.isError ? (
          <Alert severity="warning" sx={{ gridColumn: "1/-1" }}>
            Failed to load summary.
          </Alert>
        ) : (
          <>
            <Card>
              <CardContent>
                <Typography variant="caption" color="textSecondary">
                  Total Requests
                </Typography>
                <Typography variant="h6">
                  {summary.data?.totalRequests ?? 0}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="caption" color="textSecondary">
                  Avg Latency (ms)
                </Typography>
                <Typography variant="h6">
                  {summary.data?.avgLatencyMs?.toFixed(0) ?? 0}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="caption" color="textSecondary">
                  2xx OK
                </Typography>
                <Typography variant="h6">{summary.data?.ok2xx ?? 0}</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="caption" color="textSecondary">
                  Errors 4xx/5xx
                </Typography>
                <Typography variant="h6">
                  {(summary.data?.errors4xx ?? 0) +
                    (summary.data?.errors5xx ?? 0)}
                </Typography>
              </CardContent>
            </Card>
          </>
        )}
      </Box>

      {/* Top Models */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Top Models
        </Typography>
        {topModels.isLoading && <CircularProgress size={24} />}
        {topModels.isError && (
          <Alert severity="warning">Failed to load top models.</Alert>
        )}
        {topModels.data && topModels.data.length === 0 && (
          <Typography color="textSecondary">No model data.</Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {topModels.data?.map((m) => (
            <Chip
              key={m.model}
              label={`${m.model} (${m.count})`}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
        </Stack>
      </Box>

      {/* Recent Requests */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" gutterBottom>
          Recent Requests
        </Typography>
        {recent.isLoading && <CircularProgress size={24} />}
        {recent.isError && (
          <Alert severity="warning">Failed to load recent logs.</Alert>
        )}
        {recent.data && recent.data.length === 0 && (
          <Typography color="textSecondary">No recent requests.</Typography>
        )}
        {recent.data && recent.data.length > 0 && (
          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell width={140}>Time</TableCell>
                <TableCell>Endpoint</TableCell>
                <TableCell width={110}>Model</TableCell>
                <TableCell width={70}>Status</TableCell>
                <TableCell width={70}>ms</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recent.data.slice(0, 8).map((r) => (
                <TableRow key={r.apiRequestLogId} hover>
                  <TableCell>
                    {r.timestamp
                      ? new Date(r.timestamp).toLocaleTimeString()
                      : "—"}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>
                    {r.endpoint}
                  </TableCell>
                  <TableCell>{r.model ?? ""}</TableCell>
                  <TableCell>{r.statusCode ?? ""}</TableCell>
                  <TableCell>{r.durationMs ?? ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      {/* Quick Links */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 Browse Ideas
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Explore curated upcycling ideas from the community.
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate("/ideas")}
            >
              Go to Ideas
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ✨ Generate New Idea
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Get AI-powered suggestions for what to do with an item.
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate("/ideas/generate")}
            >
              Generate
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
