import { Backdrop, Box, CircularProgress, Typography } from "@mui/material"

interface GlobalLoadingProps {
    isLoading: boolean;
    backdrop?: boolean;
    message?: string;
}

const GlobalLoading = ({ isLoading, backdrop = true, message }: GlobalLoadingProps) => {
    if (!isLoading) return null;

    const content = (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <CircularProgress color="primary" />
            {message && <Typography color="text.secondary">{message}</Typography>}
        </Box>
    );

    if (!backdrop) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                {content}
            </Box>
        );
    }

    return (
        <Backdrop
            open
            sx={{ zIndex: (theme) => theme.zIndex.modal + 1, backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
            {content}
        </Backdrop>
    );
}

export default GlobalLoading;