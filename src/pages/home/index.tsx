import { Box, Typography } from "@mui/material";

const Home = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <Typography variant="h4" fontWeight={600} data-testid="text-title">
        Everysk App Template
      </Typography>
      <Typography variant="body1" color="text.secondary" data-testid="text-subtitle">
        Start building your application here.
      </Typography>
    </Box>
  );
};

export default Home;
