
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        backgroundColor: "#FFFFFF",
        color: "#3E2723",
      }}
    >
      <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexGrow: 1,
          }}
        >
          <Box
  component="img"
  src="/logo.jpg"
  alt="4Xabuoya Logo"
  sx={{
    width: 45,
    height: 45,
    objectFit: "contain",
  }}
/>

          <Typography
            variant="h5"
            fontWeight={800}
            color="primary"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/products")}
          >
            4Xabuoya
          </Typography>
        </Box>

        <Button
          color="primary"
          onClick={() => navigate("/products")}
        >
          Products
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
