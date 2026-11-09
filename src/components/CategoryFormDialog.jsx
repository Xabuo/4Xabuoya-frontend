
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
} from "@mui/material";

function CategoryFormDialog({
  open,
  onClose,
  onSave,
  category,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    status: "active",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: category?.name || "",
        description: category?.description || "",
        image: category?.image || "",
        status: category?.status || "active",
      });
      setError("");
    }
  }, [open, category]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSave(form);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {category ? "Edit Category" : "Add New Category"}
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            required
            label="Category Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            multiline
            rows={3}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Image URL"
            name="image"
            value={form.image}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={saving}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Category"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CategoryFormDialog;
