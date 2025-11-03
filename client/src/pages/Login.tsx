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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      // res.user might be undefined -> coerce to null for our slice type
      dispatch(setCredentials({ token: res.token, user: res.user ?? null }));
      navigate("/");
    } catch (err) {
      console.error(err);
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
            {error ? <Alert severity="error">Login failed</Alert> : null}
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
