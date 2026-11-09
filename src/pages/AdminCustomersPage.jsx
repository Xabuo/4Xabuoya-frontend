
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import api from "../api/axios";

function AdminCustomersPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/customers");

      setCustomers(response.data.data || response.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box>
      {/* PAGE HEADER */}
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
        <Box>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CloseIcon />}
            onClick={() => navigate("/admin")}
            sx={{ mb: 2 }}
          >
            Back to Admin
          </Button>

          <Typography
            variant="h4"
            color="primary"
            fontWeight={800}
          >
            Customers Management
          </Typography>

          <Typography color="text.secondary">
            View registered customers in 4Xabuoya.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={fetchCustomers}
          disabled={loading}
        >
          Refresh Customers
        </Button>
      </Box>

      {/* ERROR */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchCustomers}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* LOADING */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* CUSTOMER TABLE */}
      {!loading && !error && (
        <>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Total Customers: {customers.length}
          </Typography>

          {customers.length === 0 ? (
            <Alert severity="info">
              No registered customers found.
            </Alert>
          ) : (
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 3, overflowX: "auto" }}
            >
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#fff0e6" }}>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Contact Number</strong></TableCell>
                    <TableCell><strong>Address</strong></TableCell>
                    <TableCell><strong>Joined Date</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            src={customer.avatar_url || undefined}
                            alt={customer.first_name}
                          >
                            {customer.first_name?.charAt(0)?.toUpperCase()}
                          </Avatar>

                          <Box>
                            <Typography fontWeight={600}>
                              {customer.first_name} {customer.last_name}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ID: {customer.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>{customer.email}</TableCell>

                      <TableCell>
                        {customer.contact_number || "N/A"}
                      </TableCell>

                      <TableCell>
                        {customer.address || "N/A"}
                      </TableCell>

                      <TableCell>
                        {formatDate(
                          customer.joined_date || customer.created_at
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
}

export default AdminCustomersPage;
