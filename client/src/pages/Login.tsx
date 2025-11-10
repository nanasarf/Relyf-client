import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Stack,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import { useLoginMutation } from "../services/authApi";
import { useAppDispatch } from "../app/hooks";
import { setCredentials } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      // backend may return different casing/names (Token vs token, userId/email)
      const safeRes = res as unknown;
      let token: string | null = null;
      let user = null as { id: string; email: string } | null;
      if (safeRes && typeof safeRes === "object") {
        const obj = safeRes as Record<string, unknown>;
        const t1 = obj["token"];
        const t2 = obj["Token"];
        const t3 = obj["accessToken"];
        if (typeof t1 === "string") token = t1;
        else if (typeof t2 === "string") token = t2;
        else if (typeof t3 === "string") token = t3;

        if (
          "user" in obj &&
          typeof obj["user"] === "object" &&
          obj["user"] !== null
        ) {
          const u = obj["user"] as Record<string, unknown>;
          user = {
            id: u["id"] ? String(u["id"]) : "",
            email: typeof u["email"] === "string" ? u["email"] : "",
          };
        } else if ("userId" in obj) {
          user = {
            id: String(obj["userId"]),
            email: typeof obj["email"] === "string" ? obj["email"] : "",
          };
        }
      }

      if (!token) {
        // If server returned success but no token, surface message
        setServerMsg("Login succeeded but no token returned from server.");
        console.warn("login response missing token", res);
        return;
      }

      // Ensure token is persisted (authSlice also writes it, but be defensive)
      localStorage.setItem("relyf_token", token);
      dispatch(setCredentials({ token, user }));
      navigate("/");
    } catch (err) {
      console.error(err);
      // Try to show a clearer message when available using safe guards
      let msg = String(err);
      const e = err as unknown;
      if (e && typeof e === "object") {
        const obj = e as Record<string, unknown>;

        // Check for "Failed to fetch" - backend is not running
        if (obj.message && typeof obj.message === "string") {
          if (obj.message.includes("Failed to fetch")) {
            msg =
              "Cannot connect to backend server. Make sure the API is running on http://localhost:5157";
          } else {
            msg = obj.message;
          }
        } else if (obj.error && typeof obj.error === "string") msg = obj.error;
        else if (
          obj.data &&
          typeof obj.data === "object" &&
          obj.data !== null
        ) {
          const d = obj.data as Record<string, unknown>;
          if (d.message && typeof d.message === "string") msg = d.message;
        }
      }

      // Check for specific fetch errors
      if (
        msg.includes("TypeError: Failed to fetch") ||
        msg.includes("Failed to fetch")
      ) {
        msg =
          "❌ Backend server is not running. Please start the API on http://localhost:5157";
      }

      setServerMsg(msg);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Sign in
        </Typography>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" disabled={isLoading}>
              Login
            </Button>
            {error ? (
              <Alert severity="error">{serverMsg ?? "Login failed"}</Alert>
            ) : null}
            {serverMsg && !error ? (
              <Alert severity="info">{serverMsg}</Alert>
            ) : null}
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
