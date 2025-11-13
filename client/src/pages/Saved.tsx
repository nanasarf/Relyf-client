import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Chip,
  Alert,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PostProjectDialog from "../components/PostProjectDialog";

type SavedAiIdea = {
  id: string;
  title: string;
  tools: string;
  steps: string;
  safety: string;
  savedAt: string;
};

export default function Saved() {
  const [savedAiIdeas, setSavedAiIdeas] = useState<SavedAiIdea[]>([]);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [selectedIdeaData, setSelectedIdeaData] = useState<{
    title: string;
    steps: string;
    tools: string;
    safety: string;
  } | null>(null);

  useEffect(() => {
    // Load saved AI ideas from localStorage
    const saved: SavedAiIdea[] = JSON.parse(
      localStorage.getItem("relyf_saved_ai_ideas") || "[]"
    );
    setSavedAiIdeas(saved);
  }, []);

  const handleDeleteAiIdea = (ideaId: string) => {
    const updated = savedAiIdeas.filter((idea) => idea.id !== ideaId);
    setSavedAiIdeas(updated);
    localStorage.setItem("relyf_saved_ai_ideas", JSON.stringify(updated));
  };

  return (
    <Container sx={{ py: 4, maxWidth: "1000px !important" }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Saved Ideas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your collection of saved upcycling ideas
        </Typography>
      </Box>

      {savedAiIdeas.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
            No saved AI ideas yet
          </Typography>
          <Typography variant="body2">
            Save AI-generated ideas from the Create page to access them here
            anytime!
          </Typography>
        </Alert>
      ) : (
        <Stack spacing={3}>
          {savedAiIdeas.map((idea) => (
            <Card
              key={idea.id}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "rgba(67, 160, 71, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(67, 160, 71, 0.15)",
                },
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <AutoAwesomeIcon sx={{ color: "white", fontSize: 28 }} />
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="white"
                  sx={{ flexGrow: 1 }}
                >
                  {idea.title}
                </Typography>
                <Chip
                  icon={<AutoAwesomeIcon />}
                  label="AI Generated"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
                <IconButton
                  onClick={() => handleDeleteAiIdea(idea.id)}
                  sx={{
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <CardContent sx={{ p: 3 }}>
                {/* Tools Section */}
                {idea.tools && (
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 24,
                          bgcolor: "primary.main",
                          borderRadius: 1,
                        }}
                      />
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="primary.main"
                      >
                        Tools & Materials
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        pl: 2,
                        color: "text.secondary",
                        lineHeight: 1.8,
                      }}
                    >
                      {idea.tools}
                    </Typography>
                  </Box>
                )}

                {/* Steps Section */}
                {idea.steps && (
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 24,
                          bgcolor: "secondary.main",
                          borderRadius: 1,
                        }}
                      />
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="secondary.main"
                      >
                        Step-by-Step Guide
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        pl: 2,
                        color: "text.secondary",
                        lineHeight: 1.8,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {idea.steps}
                    </Typography>
                  </Box>
                )}

                {/* Safety Section */}
                {idea.safety && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(255, 152, 0, 0.08)",
                      border: "1px solid",
                      borderColor: "rgba(255, 152, 0, 0.3)",
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ color: "#F57C00" }}
                      >
                        ⚠️ Safety Tips
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.6,
                      }}
                    >
                      {idea.safety}
                    </Typography>
                  </Box>
                )}

                {/* Action Buttons */}
                <Stack spacing={2}>
                  {/* Post Project Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PostAddIcon />}
                    onClick={() => {
                      setSelectedIdeaData({
                        title: idea.title,
                        steps: idea.steps,
                        tools: idea.tools,
                        safety: idea.safety,
                      });
                      setPostDialogOpen(true);
                    }}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
                      boxShadow: "0 4px 12px rgba(67, 160, 71, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #388E3C 0%, #43A047 100%)",
                        boxShadow: "0 6px 16px rgba(67, 160, 71, 0.4)",
                      },
                    }}
                  >
                    Post This Project
                  </Button>

                  {/* Search Tutorials Box */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(25, 118, 210, 0.05)",
                      border: "1px solid",
                      borderColor: "rgba(25, 118, 210, 0.2)",
                      display: "flex",
                      alignItems: "start",
                      gap: 1.5,
                    }}
                  >
                    <Typography sx={{ fontSize: "1.2rem" }}>📚</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ mb: 0.5, color: "#1976d2" }}
                      >
                        Want more details?
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 1 }}
                      >
                        Search online for "{idea.title}" or "{idea.title}{" "}
                        tutorial" to find detailed guides, videos, and tips from
                        the crafting community.
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/search?q=${encodeURIComponent(
                              idea.title + " tutorial DIY"
                            )}`,
                            "_blank"
                          );
                        }}
                        sx={{
                          borderRadius: 1.5,
                          textTransform: "none",
                          fontSize: "0.75rem",
                        }}
                      >
                        🔍 Search Tutorials
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Post Project Dialog */}
      {selectedIdeaData && (
        <PostProjectDialog
          open={postDialogOpen}
          onClose={() => {
            setPostDialogOpen(false);
            setSelectedIdeaData(null);
          }}
          ideaTitle={selectedIdeaData.title}
          ideaSteps={selectedIdeaData.steps}
          ideaTools={selectedIdeaData.tools}
          ideaSafety={selectedIdeaData.safety}
        />
      )}
    </Container>
  );
}
