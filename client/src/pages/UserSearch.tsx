// src/pages/UserSearch.tsx
import { Box, Container, Typography } from "@mui/material";
import UserSearch from "../components/UserSearch";

export default function UserSearchPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFA" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ mb: 1, color: "primary.main" }}
        >
          Find Users
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Discover and connect with other members of the Relyf community
        </Typography>
        <UserSearch />
      </Container>
    </Box>
  );
}
