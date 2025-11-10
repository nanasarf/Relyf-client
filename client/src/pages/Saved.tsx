import { Container, Typography } from "@mui/material";

export default function Saved() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Saved Ideas
      </Typography>
      <Typography color="text.secondary">
        Your saved upcycle ideas will appear here. (MVP placeholder)
      </Typography>
    </Container>
  );
}
