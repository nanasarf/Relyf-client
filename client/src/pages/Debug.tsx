import { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import { apiUrl, API_BASE } from "../lib/apiBase";

type Result = {
  id: string;
  ok: boolean;
  status?: number | string;
  url?: string;
  body?: unknown;
  error?: string;
  headers?: Record<string, string>;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseText?: string | null;
};

export default function Debug() {
  const [results, setResults] = useState<Result[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [itemPrompt, setItemPrompt] = useState("plastic bottle");

  const token = localStorage.getItem("relyf_token") || "";

  const push = (r: Result) => setResults((s) => [r, ...s]);

  async function call(method: string, path: string, body?: unknown) {
    const id = `${method} ${path} ${Date.now()}`;
    const url = path.startsWith("/") ? apiUrl(path) : path;
    const headers: Record<string, string> = {};
    if (body) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;
    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      let parsed: unknown = text;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        // keep raw text
      }
      const h: Record<string, string> = {};
      res.headers.forEach((v, k) => (h[k] = v));
      push({
        id,
        ok: res.ok,
        status: res.status,
        url,
        body: parsed,
        headers: h,
        requestHeaders: headers,
        requestBody: body,
        responseText: text,
      });
    } catch (e: unknown) {
      // likely a network/CORS error
      const msg = e instanceof Error ? e.message : String(e);
      push({
        id,
        ok: false,
        url,
        error: msg,
        requestHeaders: headers,
        requestBody: body,
      });
    }
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Debug / Diagnostics
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2">API Base: {API_BASE}</Typography>
        <Typography variant="body2">
          Token present: {token ? "yes" : "no"}
        </Typography>
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => call("GET", "/api/Health")}>
          GET /api/Health
        </Button>
        <Button
          variant="contained"
          onClick={() => call("GET", "/api/Projects?skip=0&take=12")}
        >
          GET /api/Projects
        </Button>
        <Button
          variant="contained"
          onClick={() => call("GET", "/api/admin/logs/summary")}
        >
          GET /api/admin/logs/summary
        </Button>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">
          Get Ideas (requires item prompt)
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="e.g., plastic bottle"
          value={itemPrompt}
          onChange={(e) => setItemPrompt(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Button
          onClick={() =>
            call(
              "GET",
              `/api/Ideas?item=${encodeURIComponent(itemPrompt)}&skip=0&take=12`
            )
          }
        >
          GET /api/Ideas
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Ideas search query</Typography>
        <TextField
          size="small"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          sx={{ mr: 1 }}
        />
        <Button
          onClick={() =>
            call(
              "GET",
              `/api/ideas/search?q=${encodeURIComponent(
                searchQ
              )}&skip=0&take=12`
            )
          }
        >
          Run
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>
        Results
      </Typography>
      <Box>
        {results.map((r) => (
          <Paper key={r.id} sx={{ p: 2, mb: 1 }}>
            <Typography variant="caption">{r.id}</Typography>
            <Typography variant="body2">URL: {r.url}</Typography>
            <Typography variant="body2">
              Status: {String(r.status ?? "-")}
            </Typography>
            {r.error && <Typography color="error">Error: {r.error}</Typography>}
            {r.headers && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Response headers</Typography>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                  {JSON.stringify(r.headers, null, 2)}
                </pre>
              </Box>
            )}
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2">Body</Typography>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                {JSON.stringify(r.body ?? r.error ?? null, null, 2)}
              </pre>
            </Box>
          </Paper>
        ))}
      </Box>
    </Container>
  );
}
