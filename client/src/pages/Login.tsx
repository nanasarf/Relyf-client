import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Stack,
  Button,
  Alert,
  Paper,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import {
  useLoginMutation,
  useRegisterMutation,
  useLazyCheckUsernameQuery,
} from "../services/authApi";
import { useAppDispatch } from "../app/hooks";
import { setCredentials } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameValid, setUsernameValid] = useState(false);

  const [login, { isLoading: isLoginLoading, error: loginError }] =
    useLoginMutation();
  const [register, { isLoading: isRegisterLoading, error: registerError }] =
    useRegisterMutation();
  const [checkUsername] = useLazyCheckUsernameQuery();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const isLoading = isLoginLoading || isRegisterLoading;
  const error = loginError || registerError;

  const handleTabChange = (
    _: React.SyntheticEvent,
    newValue: "login" | "register"
  ) => {
    setMode(newValue);
    setServerMsg(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUserName("");
    setDisplayName("");
    setCountryCode("");
    setUsernameError(null);
    setUsernameValid(false);
  };

  const handleUsernameChange = async (value: string) => {
    setUserName(value);
    setUsernameError(null);
    setUsernameValid(false);

    // Basic validation
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }

    if (value.length > 20) {
      setUsernameError("Username must be less than 20 characters");
      return;
    }

    // Only allow alphanumeric and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

    // Check availability with backend
    try {
      const result = await checkUsername(value).unwrap();
      if (result.available) {
        setUsernameValid(true);
        setUsernameError(null);
      } else {
        setUsernameError(result.message || "Username is already taken");
        setUsernameValid(false);
      }
    } catch (error) {
      console.error("Error checking username:", error);
      // Log more details about the error
      if (error && typeof error === "object") {
        console.error("Error details:", JSON.stringify(error, null, 2));
      }
      setUsernameError(
        "Could not verify username availability. Please try again."
      );
    }
  };

  const handleAuthResponse = (res: unknown) => {
    console.log("Auth response received:", res);
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

    console.log("Extracted token:", token);
    console.log("Extracted user:", user);

    if (!token) {
      setServerMsg(
        `${
          mode === "login" ? "Login" : "Registration"
        } succeeded but no token returned from server.`
      );
      console.warn("auth response missing token", res);
      return;
    }

    localStorage.setItem("relyf_token", token);
    dispatch(setCredentials({ token, user }));
    console.log("Navigating to home page...");
    navigate("/");
  };

  const handleError = (err: unknown) => {
    console.error("Authentication error:", err);
    let msg = "An error occurred. Please try again.";
    const e = err as unknown;

    if (e && typeof e === "object") {
      const obj = e as Record<string, unknown>;

      // Check for RTK Query error structure
      if (obj.status && obj.data) {
        const status = obj.status;
        const data = obj.data;

        console.log("Error status:", status);
        console.log("Error data:", data);
        console.log("Error data type:", typeof data);
        console.log(
          "Error data keys:",
          data && typeof data === "object" ? Object.keys(data) : "N/A"
        );
        console.log("Error data stringified:", JSON.stringify(data, null, 2));

        // Handle different status codes
        if (status === 400) {
          // Bad Request - validation errors
          if (typeof data === "object" && data !== null) {
            const errorData = data as Record<string, unknown>;

            console.log("Checking errorData fields...");
            console.log("errorData.message:", errorData.message);
            console.log("errorData.title:", errorData.title);
            console.log("errorData.errors:", errorData.errors);

            // Check for ASP.NET Core validation errors format
            if (
              errorData.errors &&
              typeof errorData.errors === "object" &&
              errorData.errors !== null
            ) {
              // Handle validation errors object (ASP.NET format)
              const errors = errorData.errors as Record<string, unknown>;
              const errorMessages: string[] = [];

              for (const [field, value] of Object.entries(errors)) {
                if (Array.isArray(value)) {
                  // Each field can have multiple error messages
                  errorMessages.push(...value.map((v) => String(v)));
                } else if (typeof value === "string") {
                  errorMessages.push(value);
                } else {
                  errorMessages.push(`${field}: ${String(value)}`);
                }
              }

              if (errorMessages.length > 0) {
                msg = errorMessages.join(". ");
              } else {
                // If errors object is empty, use title or message
                msg =
                  (errorData.title as string) ||
                  (errorData.message as string) ||
                  "Validation failed. Please check your input.";
              }
            } else if (errorData.title && typeof errorData.title === "string") {
              // Use title if available
              if (
                errorData.title === "One or more validation errors occurred."
              ) {
                // Generic validation error, try to provide more context
                msg =
                  mode === "register"
                    ? "Registration failed. Please ensure:\n• Email is valid\n• Password is at least 6 characters\n• Passwords match"
                    : "Login failed. Please check your email and password.";
              } else {
                msg = errorData.title;
              }
            } else if (
              errorData.message &&
              typeof errorData.message === "string"
            ) {
              msg = errorData.message;
            } else if (typeof data === "string") {
              msg = data;
            } else {
              msg = "Invalid request. Please check your input.";
            }
          }
        } else if (status === 401) {
          msg = "Invalid email or password.";
        } else if (status === 409) {
          msg = "An account with this email already exists.";
        } else if (status === 500) {
          msg = "Server error. Please try again later.";
        }
      } else if (obj.message && typeof obj.message === "string") {
        // Handle fetch errors
        if (obj.message.includes("Failed to fetch")) {
          msg =
            "❌ Cannot connect to backend server. Make sure the API is running on http://localhost:5157";
        } else {
          msg = obj.message;
        }
      } else if (obj.error && typeof obj.error === "string") {
        msg = obj.error;
      } else if (
        obj.data &&
        typeof obj.data === "object" &&
        obj.data !== null
      ) {
        const d = obj.data as Record<string, unknown>;
        if (d.message && typeof d.message === "string") msg = d.message;
      }
    }

    // Final check for fetch errors
    if (
      msg.includes("TypeError: Failed to fetch") ||
      msg.includes("Failed to fetch")
    ) {
      msg =
        "❌ Backend server is not running. Please start the API on http://localhost:5157";
    }

    setServerMsg(msg);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerMsg(null);

    if (mode === "register") {
      // Validation for register
      if (!userName.trim()) {
        setServerMsg("Username is required");
        return;
      }
      if (!usernameValid) {
        setServerMsg(usernameError || "Please choose a valid username");
        return;
      }
      if (!displayName.trim()) {
        setServerMsg("Display name is required");
        return;
      }
      if (!countryCode.trim()) {
        setServerMsg("Country code is required");
        return;
      }
      if (password !== confirmPassword) {
        setServerMsg("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setServerMsg("Password must be at least 6 characters");
        return;
      }

      try {
        const res = await register({
          email,
          password,
          userName,
          displayName,
          countryCode,
        }).unwrap();
        handleAuthResponse(res);
      } catch (err) {
        handleError(err);
      }
    } else {
      // Login
      try {
        const res = await login({ email, password }).unwrap();
        handleAuthResponse(res);
      } catch (err) {
        handleError(err);
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        {/* Header with Icon */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          {mode === "login" ? (
            <LockOutlinedIcon
              sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
            />
          ) : (
            <PersonAddIcon
              sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
            />
          )}
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mode === "login"
              ? "Sign in to continue to Relyf"
              : "Register to join the Relyf community"}
          </Typography>
        </Box>

        {/* Tabs for Login/Register */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={mode}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
              },
            }}
          >
            <Tab label="Login" value="login" />
            <Tab label="Register" value="register" />
          </Tabs>
        </Box>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            {mode === "register" && (
              <>
                <TextField
                  label="Username"
                  type="text"
                  value={userName}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  placeholder="Choose a unique username"
                  helperText={
                    usernameError ||
                    (usernameValid && userName
                      ? "✓ Username available"
                      : "3-20 characters, letters, numbers, underscores only")
                  }
                  error={!!usernameError}
                  InputProps={{
                    endAdornment:
                      usernameValid && userName ? (
                        <CheckCircleIcon color="success" />
                      ) : usernameError && userName ? (
                        <ErrorIcon color="error" />
                      ) : null,
                  }}
                />
                <TextField
                  label="Display Name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  placeholder="Your display name (can be changed later)"
                  helperText="This is what others will see on your profile"
                />
              </>
            )}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
            {mode === "register" && (
              <TextField
                label="Country Code"
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                required
                fullWidth
                variant="outlined"
                placeholder="e.g., US, UK, CA"
                helperText="Enter your 2-letter country code"
              />
            )}
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              variant="outlined"
              helperText={
                mode === "register"
                  ? "Password must be at least 6 characters"
                  : ""
              }
            />
            {mode === "register" && (
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                variant="outlined"
              />
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              size="large"
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #388E3C 0%, #43A047 100%)",
                },
              }}
            >
              {isLoading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </Button>
            {error ? (
              <Alert severity="error">
                {serverMsg ??
                  `${mode === "login" ? "Login" : "Registration"} failed`}
              </Alert>
            ) : null}
            {serverMsg && !error ? (
              <Alert severity="warning">{serverMsg}</Alert>
            ) : null}
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
