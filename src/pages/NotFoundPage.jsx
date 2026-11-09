
import { Box, Button, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        textAlign: "center",
        py: 8,
        px: 2,
      }}
    >
      <ErrorIcon
        sx={{
          fontSize: 80,
          color: "primary.main",
          mb: 2,
        }}
      />

      <Typography variant="h3" fontWeight={800} gutterBottom>
        404
      </Typography>

      <Typography variant="h5" fontWeight={600} gutterBottom>
        Page Not Found
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Sorry, the page you are looking for does not exist.
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate("/products")}
      >
        Back to Products
      </Button>
    </Box>
  );
}

export default NotFoundPage;
