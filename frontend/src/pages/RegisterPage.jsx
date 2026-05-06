import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../store/authSlice";
import { FaBrain } from "react-icons/fa";
import toast from "react-hot-toast";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "DSA", "DBMS", "OS", "CN"];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    subjects: [], examDate: "", studyHoursPerDay: 4,
  });

  const toggleSubject = (subj) => {
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(subj)
        ? f.subjects.filter((s) => s !== subj)
        : [...f.subjects, subj],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.subjects.length === 0) return toast.error("Select at least one subject");
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      toast.success("Account created! Welcome 🎉");
      navigate("/");
    } else {
      toast.error(result.payload || "Registration failed");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f0f4f8", padding: "2rem"
    }}>
      <div className="card" style={{ width: 480, padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <FaBrain size={36} color="#4A90D9" />
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginTop: 8, color: "#1E3A5F" }}>
            Create Account
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "Mayank Sharma" },
            { label: "Email",     key: "email", type: "email", placeholder: "you@example.com" },
            { label: "Password",  key: "password", type: "password", placeholder: "Min 6 chars" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: 5, fontSize: "0.85rem", fontWeight: 500 }}>
                {label}
              </label>
              <input
                className="input" type={type} placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
              />
            </div>
          ))}

          {/* Subjects */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", fontWeight: 500 }}>
              Subjects
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUBJECTS.map((s) => (
                <button
                  key={s} type="button"
                  onClick={() => toggleSubject(s)}
                  style={{
                    padding: "0.35rem 0.9rem", borderRadius: 20, border: "1px solid",
                    borderColor: form.subjects.includes(s) ? "#4A90D9" : "#e2e8f0",
                    background:  form.subjects.includes(s) ? "#4A90D9" : "#fff",
                    color:       form.subjects.includes(s) ? "#fff"    : "#555",
                    cursor: "pointer", fontSize: "0.82rem", fontWeight: 500
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontSize: "0.85rem", fontWeight: 500 }}>
                Exam Date
              </label>
              <input className="input" type="date"
                value={form.examDate}
                onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontSize: "0.85rem", fontWeight: 500 }}>
                Study Hours/Day
              </label>
              <input className="input" type="number" min={1} max={12}
                value={form.studyHoursPerDay}
                onChange={(e) => setForm({ ...form, studyHoursPerDay: Number(e.target.value) })}
              />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: "100%", padding: "0.75rem" }}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "#718096" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#4A90D9", fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
