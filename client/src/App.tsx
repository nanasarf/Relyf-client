import { Box, Button, Container, Typography } from "@mui/material";

export default function App() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Relyf Client
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Vite + React + TypeScript + Redux Toolkit + MUI
        </Typography>
        <Button variant="contained">Primary Button</Button>
      </Box>
    </Container>
  );
}
