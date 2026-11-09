import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import api from "../api/axios";
import "../App.css";

function LoginPage() {
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
      const response = await api.post("/login", form);
      const { customer, token } = response.data;

      localStorage.setItem(
        "4xabuoya-customer",
        JSON.stringify(customer)
      );

      localStorage.setItem("4xabuoya-token", token);

      alert("Login successful!");

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid email or password. Please try again."
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
            <ShoppingBag size={30} />
          </div>

          <h1>Welcome Back!</h1>
          <p>Log in to your 4Xabuoya account.</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <h3>Account Information</h3>

          <input
            type="email"
            placeholder="Email Address"
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
            {loading ? "Logging In..." : "LOG IN"}
          </button>
        </form>

        <p className="register-login">
          Don't have an account?{" "}
          <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;