import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  Stack,
  IconButton,
  Skeleton,
  InputAdornment,
} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RecyclingIcon from "@mui/icons-material/Recycling";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { useGetAiIdeasQuery } from "../services/ideasApi";
import { useToasts } from "../context/ToastsContext";
import PostProjectDialog from "../components/PostProjectDialog";

type SavedAiIdea = {
  id: string;
  title: string;
  tools: string;
  steps: string;
  safety: string;
  savedAt: string;
};

export default function IdeasList() {
  const { showToast } = useToasts();
  const [itemPrompt, setItemPrompt] = useState("");
  const [skip] = useState(0);
  const take = 12;
  const [inputError, setInputError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Check for suggestion search query on mount and listen for custom events
  useEffect(() => {
    const suggestionSearch = localStorage.getItem("relyf_idea_search");
    if (suggestionSearch) {
      setItemPrompt(suggestionSearch);
      // Clear it so it doesn't persist
      localStorage.removeItem("relyf_idea_search");
    }

    // Listen for AI suggestion clicks from SuggestionsPanel
    const handleAiSuggestionClick = (event: CustomEvent) => {
      const { title } = event.detail;
      setItemPrompt(title);
    };

    window.addEventListener(
      "aiSuggestionClick",
      handleAiSuggestionClick as EventListener
    );

    return () => {
      window.removeEventListener(
        "aiSuggestionClick",
        handleAiSuggestionClick as EventListener
      );
    };
  }, []);

  // Fetch AI ideas
  const aiIdeasQuery = useGetAiIdeasQuery(
    { item: searchTerm, skip, take },
    { skip: !searchTerm.trim() }
  );

  const ideas = aiIdeasQuery.data?.ideas
    ? [
        {
          id: "ai-gen",
          title: "AI Generated Ideas",
          content: aiIdeasQuery.data.ideas,
        },
      ]
    : [];
  const isLoading = aiIdeasQuery.isLoading;
  const isError = aiIdeasQuery.isError;

  // State for Post Project dialog
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [selectedIdeaData, setSelectedIdeaData] = useState<{
    title: string;
    steps: string;
    tools: string;
    safety: string;
  } | null>(null);

  const handleGetIdea = () => {
    if (itemPrompt.trim().length < 2) {
      setInputError("Please enter at least 2 characters.");
      return;
    }
    setInputError(null);
    setSearchTerm(itemPrompt.trim()); // Only trigger search on button click
  };

  const skeletons = Array.from({ length: 6 });

  return (
    <Container sx={{ py: 4, maxWidth: "1000px !important" }}>
      {/* Hero Section */}
      <Box
        sx={{
          mb: 5,
          textAlign: "center",
          background:
            "linear-gradient(135deg, rgba(67, 160, 71, 0.08) 0%, rgba(102, 187, 106, 0.05) 100%)",
          borderRadius: 4,
          p: 4,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            background:
              "radial-gradient(circle, rgba(67, 160, 71, 0.1) 0%, transparent 70%)",
            borderRadius: "50%",
          },
        }}
      >
        <RecyclingIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
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
          Create & Discover
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: "auto" }}
        >
          Transform everyday items into creative projects with AI-powered
          upcycling ideas.
        </Typography>
      </Box>

      {/* AI Generate Section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f1f8f4 100%)",
          border: "2px solid",
          borderColor: "rgba(67, 160, 71, 0.2)",
          boxShadow: "0 4px 20px rgba(67, 160, 71, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AutoAwesomeIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700} color="primary.main">
            AI Upcycling Generator
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Have an item you want to repurpose? Our AI will suggest creative
          upcycling ideas!
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <TextField
            fullWidth
            placeholder="e.g., plastic bottle, old jeans, wine cork..."
            value={itemPrompt}
            onChange={(e) => setItemPrompt(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <RecyclingIcon sx={{ color: "primary.main" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "white",
                borderRadius: 2,
                "& fieldset": {
                  borderColor: "rgba(67, 160, 71, 0.3)",
                  borderWidth: 2,
                },
                "&:hover fieldset": {
                  borderColor: "rgba(67, 160, 71, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleGetIdea}
            disabled={isLoading || itemPrompt.trim().length < 2}
            startIcon={<AutoAwesomeIcon />}
            sx={{
              whiteSpace: "nowrap",
              px: 3,
              py: 1.5,
              borderRadius: 2,
              background: "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
              color: "white",
              boxShadow: "0 4px 12px rgba(67, 160, 71, 0.3)",
              fontWeight: 700,
              fontSize: "1.1rem",
              "&:hover": {
                background: "linear-gradient(135deg, #388E3C 0%, #43A047 100%)",
                boxShadow: "0 6px 16px rgba(67, 160, 71, 0.4)",
              },
              "&:disabled": {
                background: "rgba(0, 0, 0, 0.12)",
                color: "rgba(0,0,0,0.3)",
              },
            }}
          >
            Generate Ideas
          </Button>
        </Box>
      </Box>

      {/* Status Messages */}
      {inputError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {inputError}
        </Alert>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {aiIdeasQuery.error &&
          typeof aiIdeasQuery.error === "object" &&
          "status" in aiIdeasQuery.error &&
          aiIdeasQuery.error.status === 400
            ? "Please enter a more descriptive item (at least 2 characters)."
            : aiIdeasQuery.error &&
              typeof aiIdeasQuery.error === "object" &&
              "status" in aiIdeasQuery.error &&
              aiIdeasQuery.error.status === 500
            ? "Server error. Please try again later or use a different item."
            : "Failed to generate ideas. Please try again."}
        </Alert>
      )}

      {isLoading && (
        <Stack spacing={2}>
          {skeletons.map((_, i) => (
            <Card key={`skeleton-${i}`}>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="80%" />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Skeleton variant="rounded" width={50} height={24} />
                  <Skeleton variant="rounded" width={60} height={24} />
                  <Skeleton variant="rounded" width={40} height={24} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Ideas Grid */}
      {!isLoading && Array.isArray(ideas) && ideas.length === 0 && (
        <Alert severity="info" sx={{ my: 4 }}>
          Enter an item above to generate creative AI upcycling ideas!
        </Alert>
      )}

      {!isLoading && Array.isArray(ideas) && ideas.length > 0 && (
        <Stack spacing={2}>
          {ideas.map((idea) => {
            // Parse the AI content into structured ideas
            const content = idea.content || "";
            const ideaBlocks = content
              .split(/(?=\d+\.\s\*\*)/g)
              .filter(Boolean);

            return (
              <Box key={idea.id}>
                {/* Header Banner */}
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, rgba(67, 160, 71, 0.08) 0%, rgba(102, 187, 106, 0.05) 100%)",
                    border: "2px solid",
                    borderColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <AutoAwesomeIcon
                    sx={{ fontSize: 32, color: "primary.main" }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary.main"
                    >
                      AI-Generated Upcycling Ideas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Creative suggestions for your item
                    </Typography>
                  </Box>
                </Box>

                {/* Helpful Tips Banner */}
                <Alert
                  severity="info"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    "& .MuiAlert-icon": {
                      fontSize: 28,
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{ mb: 0.5 }}
                  >
                    💡 Tips for Success
                  </Typography>
                  <Typography variant="body2">
                    These are starter ideas! Feel free to adapt the steps based
                    on your skill level. If you're new to crafting, search
                    online for detailed video tutorials of similar projects, or
                    ask experienced friends for help. Don't hesitate to
                    experiment and make it your own!
                  </Typography>
                </Alert>

                <Stack spacing={3}>
                  {ideaBlocks.map((block, index) => {
                    // Extract title
                    const titleMatch = block.match(/\d+\.\s\*\*(.+?)\*\*/);
                    const title = titleMatch
                      ? titleMatch[1]
                      : `Idea ${index + 1}`;

                    // Extract sections
                    const toolsMatch = block.match(
                      /\*\*Tools:\*\*(.+?)(?=\*\*Steps:\*\*)/s
                    );
                    const stepsMatch = block.match(
                      /\*\*Steps:\*\*(.+?)(?=\*\*Safety:\*\*)/s
                    );
                    const safetyMatch = block.match(/\*\*Safety:\*\*(.+?)$/s);

                    const tools = toolsMatch ? toolsMatch[1].trim() : "";
                    const steps = stepsMatch ? stepsMatch[1].trim() : "";
                    const safety = safetyMatch ? safetyMatch[1].trim() : "";

                    return (
                      <Card
                        key={`ai-idea-${idea.id}-${index}-${title}`}
                        sx={{
                          borderRadius: 3,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "rgba(67, 160, 71, 0.2)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 8px 24px rgba(67, 160, 71, 0.15)",
                            transform: "translateY(-4px)",
                          },
                        }}
                      >
                        {/* Header with number badge */}
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
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              bgcolor: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "1.2rem",
                              color: "primary.main",
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="white"
                            sx={{ flexGrow: 1 }}
                          >
                            {title}
                          </Typography>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              // Save AI idea to localStorage
                              const savedIdeas: SavedAiIdea[] = JSON.parse(
                                localStorage.getItem("relyf_saved_ai_ideas") ||
                                  "[]"
                              );
                              const ideaData: SavedAiIdea = {
                                id: `ai-${Date.now()}-${index}`,
                                title,
                                tools,
                                steps,
                                safety,
                                savedAt: new Date().toISOString(),
                              };

                              // Check if already saved
                              const alreadySaved = savedIdeas.some(
                                (idea: SavedAiIdea) => idea.title === title
                              );

                              if (!alreadySaved) {
                                savedIdeas.push(ideaData);
                                localStorage.setItem(
                                  "relyf_saved_ai_ideas",
                                  JSON.stringify(savedIdeas)
                                );
                                showToast(
                                  "Idea saved successfully!",
                                  "success"
                                );
                              } else {
                                showToast("Idea already saved!", "info");
                              }
                            }}
                            sx={{
                              color: "white",
                              "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 0.2)",
                              },
                            }}
                          >
                            <BookmarkBorderIcon />
                          </IconButton>
                        </Box>

                        <CardContent sx={{ p: 3 }}>
                          {/* Tools Section */}
                          {tools && (
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
                                {tools}
                              </Typography>
                            </Box>
                          )}

                          {/* Steps Section */}
                          {steps && (
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
                              <Box
                                sx={{
                                  pl: 2,
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: "rgba(255, 152, 0, 0.03)",
                                  border: "1px dashed",
                                  borderColor: "rgba(255, 152, 0, 0.2)",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "text.secondary",
                                    lineHeight: 1.8,
                                    whiteSpace: "pre-wrap",
                                    mb: 1.5,
                                  }}
                                >
                                  {steps}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    color: "text.disabled",
                                    fontStyle: "italic",
                                    mt: 1,
                                  }}
                                >
                                  💭 Tip: Take your time with each step. If
                                  something isn't clear, try searching for
                                  similar projects online or watch video
                                  tutorials for visual guidance.
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {/* Safety Section */}
                          {safety && (
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: "rgba(255, 152, 0, 0.08)",
                                border: "1px solid",
                                borderColor: "rgba(255, 152, 0, 0.3)",
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
                                {safety}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>

                        {/* Helpful Action Footer */}
                        <Box
                          sx={{
                            px: 3,
                            pb: 3,
                            pt: 0,
                          }}
                        >
                          <Stack spacing={2}>
                            {/* Post Project Button */}
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<PostAddIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIdeaData({
                                  title,
                                  steps,
                                  tools,
                                  safety,
                                });
                                setPostDialogOpen(true);
                              }}
                              sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                py: 1.5,
                                borderRadius: 2,
                                background:
                                  "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
                                boxShadow: "0 4px 12px rgba(67, 160, 71, 0.3)",
                                "&:hover": {
                                  background:
                                    "linear-gradient(135deg, #388E3C 0%, #43A047 100%)",
                                  boxShadow:
                                    "0 6px 16px rgba(67, 160, 71, 0.4)",
                                },
                              }}
                            >
                              Post This Project
                            </Button>

                            {/* Video Tutorial Link */}
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<PlayCircleOutlineIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                const searchQuery = encodeURIComponent(
                                  `${title} tutorial for beginners`
                                );
                                window.open(
                                  `https://www.youtube.com/results?search_query=${searchQuery}`,
                                  "_blank"
                                );
                              }}
                              sx={{
                                borderColor: "primary.main",
                                color: "primary.main",
                                textTransform: "none",
                                fontWeight: 600,
                                py: 1.5,
                                "&:hover": {
                                  bgcolor: "rgba(67, 160, 71, 0.08)",
                                  borderColor: "primary.dark",
                                },
                              }}
                            >
                              Watch Video Tutorial
                            </Button>
                          </Stack>
                        </Box>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
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
