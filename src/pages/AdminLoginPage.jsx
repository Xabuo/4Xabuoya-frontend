
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import api from "../api/axios";
import "../App.css";

function AdminLoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/admin/login", form);
      const { admin, token } = response.data;

      localStorage.setItem(
        "4xabuoya-admin",
        JSON.stringify(admin)
      );

      localStorage.setItem("4xabuoya-admin-token", token);

      alert("Admin login successful!");

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid admin email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <Link to="/" className="register-back">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="register-heading">
          <div className="register-logo">
            <ShieldCheck size={30} />
          </div>

          <h1>Admin Login</h1>
          <p>Sign in to manage your 4Xabuoya store.</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <h3>Administrator Account</h3>

          <input
            type="email"
            placeholder="Admin Email Address"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          {error && (
            <p className="register-error">{error}</p>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? "Logging In..." : "ADMIN LOG IN"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
