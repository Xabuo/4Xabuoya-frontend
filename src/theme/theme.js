
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#8B4513",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#F4A261",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FFF8F0",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#3E2723",
      secondary: "#795548",
    },
  },

  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 600,
    },

    h6: {
      fontWeight: 600,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 18px",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
