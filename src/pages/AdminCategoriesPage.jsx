
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import api from "../api/axios";
import CategoryFormDialog from "../components/CategoryFormDialog";
import DeleteCategoryDialog from "../components/DeleteCategoryDialog";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const navigate = useNavigate();

  // Fetch categories from Laravel.
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/category");
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Unable to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  // Open Add Category dialog.
  const handleAdd = () => {
    setSelectedCategory(null);
    setFormOpen(true);
  };

  // Open Edit Category dialog.
  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormOpen(true);
  };

  // Add or update category.
  const handleSave = async (formData) => {
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description || "",
        image: formData.image || "",
        status: formData.status,
      };

      if (selectedCategory) {
        await api.put(
          `/category/${selectedCategory.id}`,
          payload
        );

        showMessage("Category updated successfully!");
      } else {
        await api.post("/category", payload);

        showMessage("Category added successfully!");
      }

      setFormOpen(false);
      setSelectedCategory(null);

      await fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);

      showMessage(
        err.response?.data?.message || "Failed to save category.",
        "error"
      );

      throw err;
    }
  };

  // Open Delete Confirmation dialog.
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteOpen(true);
  };

  // Delete category.
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await api.delete(`/category/${categoryToDelete.id}`);

      setDeleteOpen(false);
      setCategoryToDelete(null);

      showMessage("Category deleted successfully!");

      await fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);

      showMessage(
        err.response?.data?.message ||
          "Failed to delete category. It may still contain products.",
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
            Categories
          </Typography>

          <Typography color="text.secondary">
            Manage the food and drink categories in 4Xabuoya.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={loading}
        >
          Add Category
        </Button>
      </Box>

      {/* Messages */}
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

      {/* Error */}
      {!loading && error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchCategories}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Category List */}
      {!loading && !error && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Total Categories: {categories.length}
          </Typography>

          {categories.length === 0 ? (
            <Alert severity="info">
              No categories found. Click Add Category to create one.
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
                gap: 3,
              }}
            >
              {categories.map((category) => (
                <Card
                  key={category.id}
                  sx={{
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {category.image && (
                    <Box
                      component="img"
                      src={category.image}
                      alt={category.name}
                      sx={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {category.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, mb: 2 }}
                    >
                      {category.description || "No description available."}
                    </Typography>

                    <Chip
                      label={category.status || "Unknown"}
                      color={
                        category.status === "active"
                          ? "success"
                          : "default"
                      }
                      size="small"
                    />
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(category)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Add and Edit Dialog */}
      <CategoryFormDialog
        open={formOpen}
        category={selectedCategory}
        onClose={() => {
          setFormOpen(false);
          setSelectedCategory(null);
        }}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCategoryDialog
        open={deleteOpen}
        category={categoryToDelete}
        onClose={() => {
          setDeleteOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}

export default AdminCategoriesPage;
