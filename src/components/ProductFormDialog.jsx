
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem,
} from "@mui/material";

const emptyProduct = {
  name: "",
  category: "",
  category_id: "",
  price: "",
  description: "",
  image: "",
  stock_level: "",

};

function ProductFormDialog({
  open,
  onClose,
  onSave,
  product,
  categories = [],
}) {
  const [formData, setFormData] = useState(emptyProduct);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(product);

  useEffect(() => {
    if (product) {
      setFormData({
        ...emptyProduct,
        ...product,
        category_id: String(product.category_id ?? ""),
        price: String(product.price ?? ""),
        stock_level: String(product.stock_level ?? ""),
      });
    } else {
      setFormData({ ...emptyProduct });
    }

    setErrors({});
  }, [product, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    const price = Number(formData.price);
    const stockLevel = Number(formData.stock_level);

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required.";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Please select a category.";
    }

    if (
      formData.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      newErrors.price = "Enter a valid price of 0 or higher.";
    }

    if (
      formData.stock_level === "" ||
      !Number.isInteger(stockLevel) ||
      stockLevel < 0
    ) {
      newErrors.stock_level = "Enter a valid stock quantity.";
    }

    const selectedCategory = categories.find(
      (category) =>
        Number(category.id) === Number(formData.category_id)
    );

    if (formData.category_id && !selectedCategory) {
      newErrors.category_id = "Please select a valid category.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const productData = {
      name: formData.name.trim(),
      category: selectedCategory.name,
      category_id: Number(formData.category_id),
      price,
      description: formData.description.trim(),
      image: formData.image.trim(),
      stock_level: stockLevel,
    };

    try {
      await onSave(productData);
    } catch (error) {
      console.error("Failed to submit product:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isEditing ? "Edit Product" : "Add New Product"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
            required
          />

          <TextField
            select
            label="Category"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            error={Boolean(errors.category_id)}
            helperText={errors.category_id}
            fullWidth
            required
          >
            {categories.map((category) => (
              <MenuItem
                key={category.id}
                value={String(category.id)}
              >
                {category.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Price (₱)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            error={Boolean(errors.price)}
            helperText={errors.price}
            inputProps={{ min: 0, step: "0.01" }}
            fullWidth
            required
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          <TextField
            label="Image URL (Optional)"
            name="image"
            value={formData.image}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Stock Level"
            name="stock_level"
            type="number"
            value={formData.stock_level}
            onChange={handleChange}
            error={Boolean(errors.stock_level)}
            helperText={errors.stock_level}
            inputProps={{ min: 0, step: 1 }}
            fullWidth
            required
          />

        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>

        <Button onClick={handleSubmit} variant="contained">
          {isEditing ? "Save Changes" : "Add Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductFormDialog;
