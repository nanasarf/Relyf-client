import { Avatar, Box, Container, Stack, Typography } from "@mui/material";

export default function Profile() {
  // Future: load user profile from API
  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
        <Avatar sx={{ width: 72, height: 72 }}>U</Avatar>
        <Box>
          <Typography variant="h5">Your Profile</Typography>
          <Typography color="text.secondary">
            MVP placeholder – add display name, email, country.
          </Typography>
        </Box>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        This section will later include editable settings, activity summary, and
        achievements.
      </Typography>
    </Container>
  );
}
