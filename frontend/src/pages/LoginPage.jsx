import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../store/authSlice";
import { FaBrain } from "react-icons/fa";
import toast from "react-hot-toast";

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f0f4f8"
    }}>
      <div className="card" style={{ width: 400, padding: "2.5rem" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <FaBrain size={40} color="#4A90D9" />
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginTop: 8, color: "#1E3A5F" }}>
            AI Smart Study Planner
          </h1>
          <p style={{ color: "#718096", fontSize: "0.9rem" }}>Login to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500 }}>
              Email
            </label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500 }}>
              Password
            </label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <p style={{ color: "#e53e3e", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: "100%", padding: "0.75rem" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "#718096" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#4A90D9", fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
