import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Dashboard = () => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                textAlign: "center",
                px: 3,
            }}
        >
            <Typography
                variant="h3"
                fontWeight={700}
                data-testid="text-app-title"
                sx={{ mb: 2 }}
            >
                Everysk App Template
            </Typography>
            <Typography
                variant="h6"
                color="text.secondary"
                data-testid="text-app-subtitle"
            >
                Prompt the agent to begin building your app
            </Typography>
        </Box>
    );
};

export default Dashboard;
