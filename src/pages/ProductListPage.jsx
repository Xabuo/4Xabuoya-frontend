
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import ProductFormDialog from "../components/ProductFormDialog";
import DeleteProductDialog from "../components/DeleteProductDialog";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

function ProductListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Convert Laravel data into the format used by ProductCard.
  const formatProduct = (product, categoryList = categories) => {
    const category = categoryList.find(
      (item) => Number(item.id) === Number(product.category_id)
    );

    return {
      ...product,
      name: product.product_name,
      category:
        product.category_name || category?.name || "Uncategorized",
      description: product.product_description || "",
      image: product.image_url || "",
      rating: product.rating ?? null,
      sold: product.sold ?? 0,
      stock_level: product.stock_level ?? 0,
    };
  };

  // Fetch products and categories.
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [categoryResponse, productResponse] = await Promise.all([
        api.get("/category"),
        api.get("/products"),
      ]);

      const categoryData = categoryResponse.data.data || [];
      const productData = productResponse.data.data || [];

      setCategories(categoryData);

      setProducts(
        productData.map((product) =>
          formatProduct(product, categoryData)
        )
      );
    } catch (err) {
      console.error("Error fetching data:", err);

      setError(
        "Unable to load products. Please check your Laravel server and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  // Open Add Product dialog.
  const handleAdd = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  };

  // Open Edit Product dialog.
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };

  // Add or update a product.
  const handleSave = async (productData) => {
    try {
      const selectedCategory = categories.find(
        (category) =>
          Number(category.id) === Number(productData.category_id)
      );

      if (!selectedCategory) {
        throw new Error("Please select a valid category.");
      }

      const payload = {
        category_id: Number(productData.category_id),
        product_name: productData.name,
        product_description: productData.description || "",
        price: Number(productData.price),
        stock_level: Number(productData.stock_level),
        image_url: productData.image || "",
        product_review: productData.product_review || "",
      };

      if (selectedProduct) {
  await api.put(`/products/${selectedProduct.id}`, payload);

  showMessage("Product updated successfully!");
} else {
  await api.post("/products", payload);

  showMessage("Product added successfully!");
}

      setFormOpen(false);
      setSelectedProduct(null);

      await fetchData();
    } catch (err) {
      console.error("Error saving product:", err);

      showMessage(
        err.response?.data?.message ||
          err.message ||
          "Failed to save product.",
        "error"
      );

      throw err;
    }
  };

  // Open Delete Confirmation dialog.
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteOpen(true);
  };

  // Delete a product.
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await api.delete(`/products/${productToDelete.id}`);

      setDeleteOpen(false);
      setProductToDelete(null);

      showMessage("Product deleted successfully!");

      await fetchData();
    } catch (err) {
      console.error("Error deleting product:", err);

      showMessage(
        err.response?.data?.message ||
          "Failed to delete product.",
        "error"
      );
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Button
  variant="outlined"
  color="inherit"
  startIcon={<CloseIcon />}
  onClick={() => navigate("/admin")}
  sx={{ mb: 2 }}
>
  Back to Admin
</Button>
        <Box>
          <Typography variant="h4" color="primary" fontWeight={800}>
            Product Catalog
          </Typography>

          <Typography color="text.secondary">
            Manage the food and drinks available in 4Xabuoya.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={loading}
        >
          Add Product
        </Button>
      </Box>

      {/* Success or Error Message */}
      {message && (
        <Alert
          severity={messageType}
          sx={{ mb: 3 }}
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* API Error */}
      {!loading && error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Product List */}
      {!loading && !error && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Total Products: {products.length}
          </Typography>

          {products.length === 0 ? (
            <Alert severity="info">
              No products found. Click Add Product to create your first product.
            </Alert>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gridAutoRows: "1fr",
                gap: 3,
                alignItems: "stretch",
              }}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </Box>
          )}
        </>
      )}

      {/* Add and Edit Dialog */}
      <ProductFormDialog
        open={formOpen}
        categories={categories}
        onClose={() => {
          setFormOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSave}
        product={selectedProduct}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        product={productToDelete}
      />
    </Box>
  );
}

export default ProductListPage;
