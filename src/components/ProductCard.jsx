
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Box,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";

function ProductCard({ product, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        transition: "0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 5,
        },
      }}
    >
      {/* Product Image */}
      <Box
        sx={{
          position: "relative",
          height: 230,
          flexShrink: 0,
          overflow: "hidden",
          backgroundColor: "#f5f0eb",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: -10,
            backgroundImage: `url("${product.image}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(12px)",
            opacity: 0.55,
          },
        }}
      >
        <CardMedia
          component="img"
          image={product.image}
          alt={product.name}
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: "scale(1.20)",
            zIndex: 1,
          }}
        />
      </Box>

      {/* Product Information */}
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minWidth: 0,
          p: 2,
        }}
      >
        <Chip
          label={product.category}
          size="small"
          color="secondary"
          sx={{ mb: 1, alignSelf: "flex-start" }}
        />

        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            minHeight: 64,
            lineHeight: 1.4,
            overflow: "hidden",
            overflowWrap: "anywhere",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            minHeight: 63,
            maxHeight: 63,
            width: "100%",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.description}
        </Typography>

        <Typography
          variant="h6"
          color="primary"
          fontWeight={700}
          sx={{ mt: "auto", pt: 2 }}
        >
          ₱{Number(product.price).toLocaleString("en-PH")}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ mt: 1 }}
        >
          <StarIcon sx={{ color: "#F4A261", fontSize: 19 }} />

          <Typography variant="body2">
            {product.rating ?? "No rating"}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            • {product.sold ?? 0} sold
          </Typography>
        </Stack>
      </CardContent>

      {/* Product Actions */}
      <Box sx={{ p: 2, pt: 0, mt: "auto" }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate(`/products/${product.id}`)}
          sx={{ mb: 1 }}
        >
          View Details
        </Button>

        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<EditOutlinedIcon />}
            onClick={() => onEdit(product)}
          >
            Edit
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(product)}
          >
            Delete
          </Button>
        </Stack>
      </Box>
    </Card>
  );
}

export default ProductCard;
