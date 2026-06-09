import { Box, Typography, Avatar, Chip } from "@mui/material";
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface AISuggestion {
  id: number;
  title: string;
  category: string;
  icon: string;
}

// AI-generated creative upcycling suggestions
const aiSuggestions: AISuggestion[] = [
  {
    id: 1,
    title: "Turn thrifted hoodies into custom crop tops",
    category: "Fashion",
    icon: "🧥",
  },
  {
    id: 2,
    title: "Transform old phone cases into aesthetic wall art",
    category: "Art",
    icon: "📱",
  },
  {
    id: 3,
    title: "Make plant hangers from shoelaces",
    category: "Decor",
    icon: "🪢",
  },
  {
    id: 4,
    title: "Upcycle vinyl records into TikTok-worthy clocks",
    category: "Crafts",
    icon: "⏰",
  },
  {
    id: 5,
    title: "Create neon signs from recycled LED strips",
    category: "Lighting",
    icon: "🌈",
  },
  {
    id: 6,
    title: "DIY festival bags from denim shorts",
    category: "Accessories",
    icon: "🎒",
  },
  {
    id: 7,
    title: "Make mood lamps from plastic cups",
    category: "Tech",
    icon: "�",
  },
  {
    id: 8,
    title: "Craft polaroid frames from cereal boxes",
    category: "Art",
    icon: "📸",
  },
  {
    id: 9,
    title: "Build a charging station from skateboards",
    category: "Tech",
    icon: "�",
  },
  {
    id: 10,
    title: "Create jewelry from keyboard keys",
    category: "Accessories",
    icon: "⌨️",
  },
  {
    id: 11,
    title: "Make a selfie ring light from plastic bottles",
    category: "Lighting",
    icon: "💡",
  },
  {
    id: 12,
    title: "Turn game controllers into desk organizers",
    category: "Organization",
    icon: "🎮",
  },
  {
    id: 13,
    title: "Upcycle sneakers into planters",
    category: "Garden",
    icon: "�",
  },
  {
    id: 14,
    title: "Make sticker collages from old magazines",
    category: "Crafts",
    icon: "🧷",
  },
  {
    id: 15,
    title: "Create a mini projector from cardboard and a magnifying glass",
    category: "Tech",
    icon: "�",
  },
];

export default function SuggestionsPanel() {
  const navigate = useNavigate();
  // const displayName = user ? JSON.parse(user).displayName || "User" : "User";
  const user = localStorage.getItem("relyf_user");
  const displayName = user ? JSON.parse(user).displayName || "User" : "User";
  const [displayedSuggestions, setDisplayedSuggestions] = useState<
    AISuggestion[]
  >([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef<boolean>(false);
  const resumeTimeoutRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  // Build a long list by repeating suggestions so we can loop scroll smoothly
  // Initialize displayed suggestions
  const repeatedList = useMemo(() => {
    const COPIES = 20; // total = aiSuggestions.length * COPIES
    const arr: AISuggestion[] = [];
    for (let i = 0; i < COPIES; i++) arr.push(...aiSuggestions);
    return arr;
  }, []);

  // Initialize displayed suggestions
  useEffect(() => {
    setDisplayedSuggestions(repeatedList);
  }, [repeatedList]);

  // Auto-scroll logic: steady pace, pause on interaction, loop to top at end
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (prefersReduced) return; // no auto scroll

    const PX_PER_SEC = 25; // steady pace

    const step = (ts: number) => {
      if (pausedRef.current) {
        lastTsRef.current = ts;
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const last = lastTsRef.current ?? ts;
      const dt = Math.max(0, ts - last);
      lastTsRef.current = ts;

      const increment = (PX_PER_SEC * dt) / 1000; // px per ms
      container.scrollTop += increment;

      // Loop when reaching bottom
      if (
        container.scrollTop >=
        container.scrollHeight - container.clientHeight - 1
      ) {
        container.scrollTop = 0;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    const pause = () => {
      pausedRef.current = true;
      if (resumeTimeoutRef.current)
        window.clearTimeout(resumeTimeoutRef.current);
      // auto-resume after idle
      resumeTimeoutRef.current = window.setTimeout(() => {
        pausedRef.current = false;
      }, 2500);
    };

    const resume = () => {
      pausedRef.current = false;
      if (resumeTimeoutRef.current)
        window.clearTimeout(resumeTimeoutRef.current);
    };

    // Reusable typed listeners
    const pauseListener: EventListener = () => pause();
    const resumeListener: EventListener = () => resume();

    container.addEventListener("wheel", pauseListener, { passive: true });
    container.addEventListener("touchstart", pauseListener, { passive: true });
    container.addEventListener("pointerdown", pauseListener);
    container.addEventListener("mouseenter", pauseListener);
    container.addEventListener("mouseleave", resumeListener);
    container.addEventListener("scroll", pauseListener, { passive: true });

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      container.removeEventListener("wheel", pauseListener);
      container.removeEventListener("touchstart", pauseListener);
      container.removeEventListener("pointerdown", pauseListener);
      container.removeEventListener("mouseenter", pauseListener);
      container.removeEventListener("mouseleave", resumeListener);
      container.removeEventListener("scroll", pauseListener);
      if (resumeTimeoutRef.current)
        window.clearTimeout(resumeTimeoutRef.current);
    };
  }, [displayedSuggestions]);

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    // Dispatch a custom event with the suggestion data
    const event = new CustomEvent("aiSuggestionClick", {
      detail: { title: suggestion.title },
    });
    window.dispatchEvent(event);

    // Navigate to ideas page if not already there
    navigate("/ideas");
  };

  return (
    <Box
      sx={{
        width: 320,
        position: "fixed",
        right: 0,
        top: 0,
        height: "100vh",
        p: 3,
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
      }}
    >
      {/* Current User - Static */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, mt: 2 }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            background: "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
            fontWeight: 600,
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ ml: 2, flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            Your Account
          </Typography>
        </Box>
      </Box>

      {/* AI Suggestions Header - Static */}
      <Box
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: 2,
          background: "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AutoAwesomeIcon sx={{ fontSize: "1rem" }} />
          <Typography variant="body2" fontWeight={600}>
            AI Upcycling Ideas
          </Typography>
        </Box>
      </Box>

      {/* Hint Text - Static */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mb: 1,
          color: "text.secondary",
          fontSize: "0.75rem",
          fontStyle: "italic",
        }}
      >
        💡 Click any idea to get started! Scroll for more...
      </Typography>

      {/* AI Suggestions List - Auto-scrolling but interactive */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
          flexGrow: 1,
          pr: 1,
          scrollBehavior: "auto",
          "&::-webkit-scrollbar": {
            width: 6,
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "rgba(67, 160, 71, 0.05)",
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(67, 160, 71, 0.3)",
            borderRadius: 3,
            "&:hover": {
              bgcolor: "rgba(67, 160, 71, 0.5)",
            },
          },
        }}
      >
        {displayedSuggestions.map((suggestion, index) => (
          <Box
            key={`${suggestion.id}-${index}`}
            onClick={() => handleSuggestionClick(suggestion)}
            sx={{
              py: 2,
              px: 1,
              cursor: "pointer",
              transition: "all 0.2s ease",
              borderBottom: "1px solid rgba(67, 160, 71, 0.1)",
              "&:hover": {
                bgcolor: "rgba(67, 160, 71, 0.05)",
                pl: 2,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Emoji */}
              <Typography
                sx={{
                  fontSize: "2rem",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {suggestion.icon}
              </Typography>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    fontSize: "0.9rem",
                    mb: 0.5,
                    color: "text.primary",
                    lineHeight: 1.4,
                  }}
                >
                  {suggestion.title}
                </Typography>
                <Chip
                  label={suggestion.category}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #66BB6A 0%, #43A047 100%)",
                    color: "white",
                  }}
                />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "0.7rem", lineHeight: 1.6 }}
        >
          About · Help · Press · API · Jobs · Privacy · Terms
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2, fontSize: "0.7rem" }}
        >
          © 2025 RELYF - Upcycle, Reuse, Reimagine
        </Typography>
      </Box>
    </Box>
  );
}
