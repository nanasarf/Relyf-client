// src/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import SuggestionsPanel from "./components/SuggestionsPanel";
import OfflineBanner from "./components/OfflineBanner";
import RequireAuth from "./components/RequireAuth";
import BottomNav from "./components/BottomNav";
import { ToastsProvider } from "./components/Toasts";
import { Box } from "@mui/material";

import IdeasList from "./pages/ideasList";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import IdeaDetail from "./pages/IdeaDetail";
import ProjectsFeed from "./pages/ProjectsFeed";
import UserProfile from "./pages/UserProfile";
import UserSearchPage from "./pages/UserSearch";

// Shell shown only for authed pages
function ProtectedLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: "280px" },
          mr: { xs: 0, lg: "320px" },
          minHeight: "100vh",
          bgcolor: "background.default",
          width: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
          pb: { xs: 7, md: 0 },
        }}
      >
        <OfflineBanner />
        <Outlet />
      </Box>
      <SuggestionsPanel />
      <BottomNav />
    </Box>
  );
}

export default function App() {
  return (
    <ToastsProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<RequireAuth />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/ideas" element={<IdeasList />} />
              <Route path="/explore" element={<ProjectsFeed />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ideas/:id" element={<IdeaDetail />} />
              <Route path="/users/:id" element={<UserProfile />} />
              <Route path="/search-users" element={<UserSearchPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastsProvider>
  );
}
