
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import api from "../api/axios";
import "../App.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    zip_code: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const address = [
        form.street,
        form.barangay,
        form.city,
        form.province,
        form.zip_code,
      ]
        .filter(Boolean)
        .join(", ");

      const response = await api.post("/register", {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        contact_number: form.contact_number,
        address,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      const { customer, token } = response.data;

      localStorage.setItem(
        "4xabuoya-customer",
        JSON.stringify(customer)
      );

      localStorage.setItem("4xabuoya-token", token);

      alert("Your 4Xabuoya account has been created!");

      navigate("/", { replace: true });
    } catch (err) {
      const errors = err.response?.data?.errors;

      setError(
        errors
          ? Object.values(errors).flat().join("\n")
          : err.response?.data?.message ||
              "Registration failed. Please try again."
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

          <h1>Join 4Xabuoya!</h1>
          <p>
            Create your account and enjoy your favorite
            food delivered to your doorstep.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <h3>Personal Information</h3>

          <div className="register-grid">
            <input
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              required
            />

            <input
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="contact_number"
            placeholder="Contact Number"
            value={form.contact_number}
            onChange={handleChange}
            required
          />

          <h3>Delivery Address</h3>

          <input
            name="street"
            placeholder="Street / Zone"
            value={form.street}
            onChange={handleChange}
            required
          />

          <input
            name="barangay"
            placeholder="Barangay"
            value={form.barangay}
            onChange={handleChange}
            required
          />

          <div className="register-grid">
            <input
              name="city"
              placeholder="Town / City"
              value={form.city}
              onChange={handleChange}
              required
            />

            <input
              name="province"
              placeholder="Province"
              value={form.province}
              onChange={handleChange}
              required
            />
          </div>

          <input
            name="zip_code"
            placeholder="ZIP Code (Optional)"
            value={form.zip_code}
            onChange={handleChange}
          />

          <h3>Account Security</h3>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
          />

          <input
            type="password"
            name="password_confirmation"
            placeholder="Confirm Password"
            value={form.password_confirmation}
            onChange={handleChange}
            required
            minLength={8}
          />

          {error && (
            <p className="register-error">{error}</p>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <p className="register-login">
          Already have an account?{" "}
          <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
