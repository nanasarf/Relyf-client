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
import NavBar from "./components/NavBar";
import OfflineBanner from "./components/OfflineBanner";
import RequireAuth from "./components/RequireAuth";
import { ToastsProvider } from "./components/Toasts";

import IdeasList from "./pages/ideasList";
import IdeaGenerate from "./pages/ideaGenerate";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import IdeaDetail from "./pages/IdeaDetail";
import ProjectsFeed from "./pages/ProjectsFeed";

// Shell shown only for authed pages
function ProtectedLayout() {
  return (
    <>
      <OfflineBanner />
      <NavBar />
      <Outlet />
    </>
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
              <Route path="/ideas/generate" element={<IdeaGenerate />} />
              <Route path="/feed" element={<ProjectsFeed />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ideas/:id" element={<IdeaDetail />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastsProvider>
  );
}
