import { useEffect, useRef, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  useGenerateIdeaMutation,
  type GenerateIdeaResponse,
} from "../services/ideasApi";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useToasts } from "../context/ToastsContext";

const SUGGESTIONS = [
  "Upcycle plastic bottles into planters for small apartments",
  "DIY storage solutions from old cardboard boxes",
  "Turn worn-out jeans into a durable tote bag",
  "Creative ways to reuse glass jars in the kitchen",
];

export default function IdeaGenerate() {
  const navigate = useNavigate();
  const { showToast } = useToasts();
  const [prompt, setPrompt] = useState("");
  const [generateIdea, { isLoading }] = useGenerateIdeaMutation();
  const [generatedIdea, setGeneratedIdea] =
    useState<GenerateIdeaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Typing animation for the generated text
  const [displayedText, setDisplayedText] = useState("");
  const typingTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // whenever a new idea arrives, animate its ideaText
    if (!generatedIdea?.ideaText) {
      setDisplayedText("");
      return;
    }
    const text = generatedIdea.ideaText.toString();
    setDisplayedText("");
    let i = 0;
    if (typingTimer.current) window.clearInterval(typingTimer.current);
    typingTimer.current = window.setInterval(() => {
      i += 2; // 2 chars per tick for a snappier feel
      if (i >= text.length) {
        setDisplayedText(text);
        if (typingTimer.current) window.clearInterval(typingTimer.current);
      } else {
        setDisplayedText(text.slice(0, i));
      }
    }, 12);
    return () => {
      if (typingTimer.current) window.clearInterval(typingTimer.current);
    };
  }, [generatedIdea]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setError(null);
    try {
      const result = await generateIdea({ promptText: prompt }).unwrap();
      setGeneratedIdea(result);
      showToast("Idea generated successfully!", "success");
    } catch (err) {
      let msg = "Failed to generate idea";
      const e = err as unknown;
      if (e && typeof e === "object") {
        const obj = e as Record<string, unknown>;
        if (obj.data && typeof obj.data === "object" && obj.data !== null) {
          const d = obj.data as Record<string, unknown>;
          if (typeof d.message === "string") msg = d.message;
        }
      }
      setError(msg);
      showToast(msg, "error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Generate Idea
      </Typography>

      {/* Prompt Input */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Enter a prompt"
          placeholder="Describe what kind of idea you want to generate..."
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setError(null);
          }}
          disabled={isLoading}
        />
        {/* Helper prompt suggestions */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {SUGGESTIONS.map((s) => (
            <Chip
              key={s}
              label={s}
              size="small"
              variant="outlined"
              onClick={() => setPrompt(s)}
            />
          ))}
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} /> : "Generate"}
        </Button>
      </Stack>

      {/* Generated Idea Result */}
      {generatedIdea && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {String(generatedIdea?.title || "Generated Idea")}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2" color="textSecondary">
                Result
              </Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  onClick={() => {
                    const text = generatedIdea?.ideaText?.toString() ?? "";
                    navigator.clipboard.writeText(text).then(
                      () => showToast("Copied to clipboard", "success"),
                      () => showToast("Failed to copy", "error")
                    );
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography
              variant="body2"
              color="textSecondary"
              paragraph
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {displayedText ||
                String(generatedIdea?.ideaText || "No description available")}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              onClick={() => {
                setPrompt("");
                setGeneratedIdea(null);
                setDisplayedText("");
              }}
            >
              Generate Another
            </Button>
            <Button
              size="small"
              color="primary"
              onClick={() => {
                navigate("/ideas");
                showToast("Check out your new idea in the list!", "info");
              }}
            >
              View All Ideas
            </Button>
          </CardActions>
        </Card>
      )}
    </Container>
  );
}
