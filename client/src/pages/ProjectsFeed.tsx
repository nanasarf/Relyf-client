import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { ProjectCard, ProjectCardSkeleton } from "../components/ProjectCard";
import { useGetExploreProjectsQuery } from "../services/projectsApi";

// Placeholder feed until backend provides a list endpoint for projects
export default function ProjectsFeed() {
  const PAGE_SIZE = 12;
  const [skip, setSkip] = useState(0);
  // try to exclude the current user's projects so Explore shows others' work
  const rawUser = localStorage.getItem("relyf_user");
  const currentUserId = rawUser
    ? (JSON.parse(rawUser).userId as number)
    : undefined;

  const { data, isLoading, isFetching, refetch } = useGetExploreProjectsQuery({
    skip,
    take: PAGE_SIZE,
    excludeUserId: currentUserId,
  });
  const projects = data?.results ?? [];
  const total = data?.total ?? 0;
  const hasMore = projects.length < total;

  // Intersection Observer for auto-load next page
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isFetching) {
          setSkip((prev) => prev + PAGE_SIZE);
        }
      },
      { rootMargin: "120px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  // Manual load more fallback (e.g., if IntersectionObserver not triggered)
  const handleLoadMore = () => {
    if (hasMore && !isFetching) setSkip((prev) => prev + PAGE_SIZE);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Explore
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 2,
        }}
      >
        {projects.map((p) => (
          <ProjectCard key={p.projectId} project={p} />
        ))}
        {(isLoading || (isFetching && projects.length === 0)) &&
          Array.from({ length: 8 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
      </Box>
      <Box ref={sentinelRef} sx={{ height: 1 }} />
      <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
        {hasMore ? (
          <Button
            onClick={handleLoadMore}
            disabled={isFetching}
            variant="outlined"
            size="small"
          >
            {isFetching ? <CircularProgress size={18} /> : "Load More"}
          </Button>
        ) : (
          projects.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              End of results
            </Typography>
          )
        )}
        <Button onClick={() => refetch()} size="small" disabled={isFetching}>
          Refresh
        </Button>
        <Typography variant="caption" color="text.secondary">
          {projects.length}/{total} loaded
        </Typography>
      </Box>
      {projects.length === 0 && !isLoading && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No projects yet. Create one from an idea to see it here.
        </Typography>
      )}
    </Box>
  );
}
