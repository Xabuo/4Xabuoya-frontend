
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Users,
  ChartColumn,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import api from "../api/axios";
import "./AdminDashboardPage.css";

function AdminDashboardPage() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem("4xabuoya-admin");
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
  totalOrders: 0,
  totalProducts: 0,
  totalCustomers: 0,
  totalSales: 0,
});

  const adminToken = localStorage.getItem("4xabuoya-admin-token");

  // VERIFY ADMIN TOKEN
  useEffect(() => {
    const verifyAdmin = async () => {
      if (!adminToken) {
        navigate("/admin/login", { replace: true });
        return;
      }

      try {
        await api.get("/admin", {
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
});

// FETCH DASHBOARD STATISTICS
const results = await Promise.allSettled([
  api.get("/admin/sales-reports"),
  api.get("/products"),
  api.get("/admin/customers"),
]);

const salesData =
  results[0].status === "fulfilled"
    ? results[0].value.data
    : {};

const productsData =
  results[1].status === "fulfilled"
    ? results[1].value.data.data || results[1].value.data
    : [];

const customersData =
  results[2].status === "fulfilled"
    ? results[2].value.data.data || results[2].value.data
    : [];

setStats({
  totalOrders: salesData.total_orders ?? 0,
  totalProducts: Array.isArray(productsData)
    ? productsData.length
    : 0,
  totalCustomers: Array.isArray(customersData)
    ? customersData.length
    : 0,
  totalSales: Number(salesData.total_revenue ?? 0),
});

setLoading(false);
      } catch (error) {
        localStorage.removeItem("4xabuoya-admin");
        localStorage.removeItem("4xabuoya-admin-token");

        navigate("/admin/login", { replace: true });
      }
    };

    verifyAdmin();
  }, [adminToken, navigate]);

  // ADMIN LOGOUT
  const handleLogout = async () => {
    try {
      await api.post(
        "/admin/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
    } catch (error) {
      console.error("Admin logout error:", error);
    } finally {
      localStorage.removeItem("4xabuoya-admin");
      localStorage.removeItem("4xabuoya-admin-token");

      navigate("/admin/login", { replace: true });
    }
  };

  if (loading) {
    return <div className="admin-loading">Verifying Admin access...</div>;
  }

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <ShieldCheck size={30} />
          <div>
            <h2>4Xabuoya</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-navigation">
          <p className="admin-nav-label">MAIN MENU</p>

          <button
  type="button"
  className="admin-nav-item active"
  onClick={() => navigate("/admin")}
>
  <LayoutDashboard size={19} />
  Dashboard
</button>

          <button
  type="button"
  className="admin-nav-item"
  onClick={() => navigate("/admin/orders")}
>
  <ShoppingBag size={19} />
  Orders
</button>

          <button
  type="button"
  className="admin-nav-item"
  onClick={() => navigate("/admin/products")}
>
  <Package size={19} />
  Products
</button>

          <button
  type="button"
  className="admin-nav-item"
  onClick={() => navigate("/admin/categories")}
>
  <Tags size={19} />
  Categories
</button>

          <button
  type="button"
  className="admin-nav-item"
  onClick={() => navigate("/admin/customers")}
>
  <Users size={19} />
  Customers
</button>

         <button
  type="button"
  className="admin-nav-item"
  onClick={() => navigate("/admin/sales-reports")}
>
  <ChartColumn size={19} />
  Sales Reports
</button>
        </nav>

        <button
          className="admin-logout-button"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          Log Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">

        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">ADMINISTRATION</span>
            <h1>Dashboard</h1>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div>
              <strong>{admin?.name || "Administrator"}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <section className="admin-welcome">
          <div>
            <h2>Welcome back, {admin?.name || "Admin"}!</h2>
            <p>
              Manage your 4Xabuoya store from your admin dashboard.
            </p>
          </div>
        </section>

       <section className="admin-stats">
  <div className="admin-stat-card">
    <ShoppingBag size={24} />
    <span>Total Orders</span>
    <h2>{stats.totalOrders}</h2>
    <small>All registered orders</small>
  </div>

  <div className="admin-stat-card">
    <Package size={24} />
    <span>Total Products</span>
    <h2>{stats.totalProducts}</h2>
    <small>Products in your store</small>
  </div>

  <div className="admin-stat-card">
    <Users size={24} />
    <span>Total Customers</span>
    <h2>{stats.totalCustomers}</h2>
    <small>Registered customers</small>
  </div>

  <div className="admin-stat-card">
    <ChartColumn size={24} />
    <span>Total Sales</span>
    <h2>
      ₱{stats.totalSales.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </h2>
    <small>Revenue from delivered orders</small>
  </div>
</section>

        <section className="admin-content-card">
          <h2>Store Overview</h2>
          <p>
           Your dashboard displays your store's current orders,
products, registered customers, and sales information.
          </p>
        </section>

      </main>
    </div>
  );
}

export default AdminDashboardPage;
