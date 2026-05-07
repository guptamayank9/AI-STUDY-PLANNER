import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiZap, FiAward } from "react-icons/fi";

const ALL_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "DSA", "DBMS", "OS", "CN",
];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name:             user?.name             || "",
    subjects:         user?.subjects         || [],
    examDate:         user?.examDate?.slice(0, 10) || "",
    studyHoursPerDay: user?.studyHoursPerDay || 4,
    preferences: {
      studyStartTime: user?.preferences?.studyStartTime || "09:00",
      studyEndTime:   user?.preferences?.studyEndTime   || "21:00",
    },
  });

  const [saving, setSaving] = useState(false);

  const toggleSubject = (s) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(s)
        ? f.subjects.filter((x) => x !== s)
        : [...f.subjects, s],
    }));

  // ── Save without calling loadUser ─────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/user/profile", form);
      // Update Redux store manually — no loadUser call
      dispatch({
        type: "auth/updateUser",
        payload: data.user,
      });
      toast.success("Profile updated successfully! ✅");
    } catch (err) {
      console.error("Profile save error:", err);
      toast.error("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "1.5rem" }}>
        Profile & Settings
      </h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FiZap size={28} color="#ed8936" />
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{user?.streak || 0}</div>
            <div style={{ fontSize: "0.8rem", color: "#718096" }}>Day Streak</div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FiAward size={28} color="#9f7aea" />
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{user?.totalPoints || 0}</div>
            <div style={{ fontSize: "0.8rem", color: "#718096" }}>Total Points</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.2rem" }}>Edit Profile</h2>

        {/* Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: 5, fontSize: "0.85rem", fontWeight: 500 }}>
            Name
          </label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Subjects */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", fontWeight: 500 }}>
            Subjects
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ALL_SUBJECTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSubject(s)}
                style={{
                  padding: "0.35rem 0.9rem",
                  borderRadius: 20,
                  border: "1px solid",
                  borderColor: form.subjects.includes(s) ? "#4A90D9" : "#e2e8f0",
                  background:  form.subjects.includes(s) ? "#4A90D9" : "#fff",
                  color:       form.subjects.includes(s) ? "#fff"    : "#555",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Exam Date + Study Hours */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.85rem", fontWeight: 500 }}>
              Exam Date
            </label>
            <input
              className="input"
              type="date"
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.85rem", fontWeight: 500 }}>
              Study Hours/Day
            </label>
            <input
              className="input"
              type="number"
              min={1}
              max={12}
              value={form.studyHoursPerDay}
              onChange={(e) => setForm({ ...form, studyHoursPerDay: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Study Start + End Time */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.85rem", fontWeight: 500 }}>
              Study Start Time
            </label>
            <input
              className="input"
              type="time"
              value={form.preferences.studyStartTime}
              onChange={(e) =>
                setForm({ ...form, preferences: { ...form.preferences, studyStartTime: e.target.value } })
              }
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.85rem", fontWeight: 500 }}>
              Study End Time
            </label>
            <input
              className="input"
              type="time"
              value={form.preferences.studyEndTime}
              onChange={(e) =>
                setForm({ ...form, preferences: { ...form.preferences, studyEndTime: e.target.value } })
              }
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
