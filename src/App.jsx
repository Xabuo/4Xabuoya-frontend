
import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";
import StorefrontPage from "./pages/StorefrontPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminCustomersPage from "./pages/AdminCustomersPage";
import AdminSalesReportsPage from "./pages/AdminSalesReportsPage";
function App() {
  return (
    <Routes>
      {/* CUSTOMER PAGES */}
      <Route path="/" element={<StorefrontPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ADMIN PAGES */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/products" element={<ProductListPage />} />
      <Route path="/admin/categories" element={<AdminCategoriesPage />} />
      <Route path="/admin/orders" element={<AdminOrdersPage />} />
      <Route path="/admin/customers" element={<AdminCustomersPage />} />
      <Route path="/admin/reports" element={<AdminSalesReportsPage />} />
      <Route path="/admin/sales-reports" element={<AdminSalesReportsPage />}
      
      />
      {/* EXISTING PRODUCT PAGES */}
      <Route element={<MainLayout />}>
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
      </Route>

      {/* NOT FOUND */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
