
import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

function MainLayout() {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default MainLayout;
