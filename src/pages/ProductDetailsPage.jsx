
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);

        const data = response.data.data || response.data;

        setProduct({
          ...data,
          name: data.product_name || data.name,
          category:
            data.category?.name ||
            data.category_name ||
            data.category ||
            "Uncategorized",
          description:
            data.product_description || data.description || "",
          image: data.image_url || data.image || "",
          rating: data.rating ?? null,
          sold: data.sold ?? 0,
        });
      } catch (err) {
        console.error("Error fetching product:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load product details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Product not found."}
        </Alert>

        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/products")}
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/products")}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Stack direction={{ xs: "column", md: "row" }}>
          {product.image && (
            <CardMedia
              component="img"
              image={product.image}
              alt={product.name}
              sx={{
                width: { xs: "100%", md: "50%" },
                height: { xs: 260, md: 420 },
                objectFit: "cover",
              }}
            />
          )}

          <Box sx={{ p: { xs: 3, md: 5 }, flex: 1 }}>
            <Chip
              label={product.category}
              color="secondary"
              sx={{ mb: 2 }}
            />

            <Typography variant="h4" fontWeight={800} gutterBottom>
              {product.name}
            </Typography>

            <Typography
              variant="h5"
              color="primary"
              fontWeight={700}
              sx={{ mb: 2 }}
            >
              ₱{Number(product.price).toLocaleString("en-PH")}
            </Typography>

            <Typography color="text.secondary" paragraph>
              {product.description || "No description available."}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1}>
              <StarIcon sx={{ color: "#F4A261" }} />

              <Typography>
                {product.rating ?? "No rating"}
              </Typography>

              <Typography color="text.secondary">
                • {product.sold} sold
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}

export default ProductDetailsPage;
