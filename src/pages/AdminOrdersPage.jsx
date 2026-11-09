
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
  Chip,
  Select,
  MenuItem,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import api from "../api/axios";

const orderStatuses = [
  "Pending",
  "Processing",
  "Packed",
  "Ready for Pickup",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function AdminOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState(null);

  // FETCH ALL ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/orders");

      setOrders(response.data.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load customer orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // UPDATE ORDER STATUS
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setSavingId(orderId);
      setMessage("");
      setError("");

      const response = await api.patch(
        `/admin/orders/${orderId}/status`,
        {
          order_status: newStatus,
        }
      );

      const updatedOrder = response.data.data || response.data;

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? { ...order, ...updatedOrder }
            : order
        )
      );

      setMessage(`Order #${orderId} updated to ${newStatus}.`);
    } catch (err) {
      console.error("Error updating order:", err);

      setError(
        err.response?.data?.message ||
        "Unable to update order status."
      );
    } finally {
      setSavingId(null);
    }
  };

  const formatPrice = (amount) => {
    return `₱${Number(amount || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Cancelled":
        return "error";
      case "Processing":
      case "Packed":
      case "Shipped":
      case "Ready for Pickup":
        return "info";
      default:
        return "warning";
    }
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
            Orders Management
          </Typography>

          <Typography color="text.secondary">
            View and manage customer orders in 4Xabuoya.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={fetchOrders}
          disabled={loading}
        >
          Refresh Orders
        </Button>
      </Box>

      {/* SUCCESS MESSAGE */}
      {message && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchOrders}
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

      {/* ORDERS TABLE */}
      {!loading && !error && (
        <>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Total Orders: {orders.length}
          </Typography>

          {orders.length === 0 ? (
            <Alert severity="info">
              No customer orders found.
            </Alert>
          ) : (
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 3, overflowX: "auto" }}
            >
              <Table sx={{ minWidth: 1100 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#fff0e6" }}>
                    <TableCell><strong>Order ID</strong></TableCell>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell><strong>Products</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell><strong>Payment</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Update Status</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        #{order.id}
                      </TableCell>

                      <TableCell>
                        {order.customer
                          ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
                          : "Unknown Customer"}

                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {order.customer?.email || ""}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {order.items?.map((item) => (
                          <Typography
                            key={item.id}
                            variant="body2"
                            sx={{ mb: 0.5 }}
                          >
                            {item.product?.product_name || "Product"} × {item.quantity}
                          </Typography>
                        ))}
                      </TableCell>

                      <TableCell>
                        {formatDate(order.order_date)}
                      </TableCell>

                      <TableCell>
                        <strong>
                          {formatPrice(
                            order.grand_total ?? order.total_amount
                          )}
                        </strong>
                      </TableCell>

                      <TableCell>
                        {order.payment_method || "N/A"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={order.order_status || "Pending"}
                          color={getStatusColor(order.order_status)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Select
  size="small"
  value={order.order_status || "Pending"}
  disabled={
    savingId === order.id ||
    order.order_status === "Cancelled"
  }
                          onChange={(e) =>
                            handleStatusChange(
                              order.id,
                              e.target.value
                            )
                          }
                          sx={{ minWidth: 155 }}
                        >
                          {orderStatuses.map((status) => (
                            <MenuItem
                              key={status}
                              value={status}
                            >
                              {status}
                            </MenuItem>
                          ))}
                        </Select>

                        {savingId === order.id && (
                          <CircularProgress
                            size={16}
                            sx={{ ml: 1 }}
                          />
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

export default AdminOrdersPage;
