
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import api from "../api/axios";

function AdminSalesReportsPage() {
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/sales-reports");

      setReport(response.data);
    } catch (err) {
      console.error("Error loading sales reports:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load sales reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatPrice = (amount) =>
    `₱${Number(amount || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const summaryCards = [
    {
      title: "Total Orders",
      value: report?.total_orders ?? 0,
      description: "All customer orders",
    },
    {
      title: "Total Revenue",
      value: formatPrice(report?.total_revenue),
      description: "From delivered orders",
    },
    {
      title: "Delivered Orders",
      value: report?.delivered_orders ?? 0,
      description: "Successfully completed",
    },
    {
      title: "Cancelled Orders",
      value: report?.cancelled_orders ?? 0,
      description: "Cancelled by customers or admin",
    },
  ];

  return (
    <Box>
      {/* HEADER */}
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
            Sales Reports
          </Typography>

          <Typography color="text.secondary">
            View your 4Xabuoya sales and order performance.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={fetchReport}
          disabled={loading}
        >
          Refresh Reports
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && report && (
        <>
          {/* SUMMARY CARDS */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {summaryCards.map((card) => (
              <Grid item xs={12} sm={6} md={3} key={card.title}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    fontWeight={600}
                  >
                    {card.title}
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="primary"
                    sx={{ my: 1 }}
                  >
                    {card.value}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {card.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* RECENT ORDERS */}
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ mb: 2 }}
          >
            Recent Orders
          </Typography>

          {report.recent_orders?.length === 0 ? (
            <Alert severity="info">
              No orders available yet.
            </Alert>
          ) : (
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 3, overflowX: "auto" }}
            >
              <Table sx={{ minWidth: 750 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#fff0e6" }}>
                    <TableCell><strong>Order ID</strong></TableCell>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Payment</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(report.recent_orders || []).map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>#{order.id}</TableCell>

                      <TableCell>
                        {order.customer
                          ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
                          : "Unknown Customer"}
                      </TableCell>

                      <TableCell>
                        {formatDate(order.order_date)}
                      </TableCell>

                      <TableCell>
                        {formatPrice(
                          order.grand_total ?? order.total_amount
                        )}
                      </TableCell>

                      <TableCell>
                        {order.payment_method || "N/A"}
                      </TableCell>

                      <TableCell>
                        {order.order_status || "Pending"}
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

export default AdminSalesReportsPage;
