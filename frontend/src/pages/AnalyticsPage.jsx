import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPerformance, fetchWeekly } from "../store/analyticsSlice";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from "recharts";
import { FiTrendingUp, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { performance, prediction, weeklyData, streak, loading } = useSelector((s) => s.analytics);

  useEffect(() => {
    dispatch(fetchPerformance());
    dispatch(fetchWeekly());
  }, [dispatch]);

  const radarData = performance.map((p) => ({ subject: p.subject, score: p.avgScore }));

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "1.5rem" }}>
        Analytics & Performance
      </h1>

      {loading ? (
        <p style={{ color: "#718096" }}>Loading analytics...</p>
      ) : (
        <>
          {/* Prediction Banner */}
          {prediction && (
            <div className="card" style={{
              marginBottom: "1.5rem",
              background: prediction.overall_predicted_score >= 70 ? "#f0fff4" : "#fff5f5",
              borderLeft: `4px solid ${prediction.overall_predicted_score >= 70 ? "#48bb78" : "#fc8181"}`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                {prediction.overall_predicted_score >= 70
                  ? <FiCheckCircle size={20} color="#48bb78" />
                  : <FiAlertTriangle size={20} color="#e53e3e" />}
                <span style={{ fontWeight: 600, fontSize: "1rem" }}>
                  AI Prediction: Overall Score ~{prediction.overall_predicted_score}%
                </span>
              </div>
              {prediction.tips?.map((tip, i) => (
                <p key={i} style={{ fontSize: "0.88rem", color: "#555", marginTop: 4 }}>💡 {tip}</p>
              ))}
              {prediction.weak_subjects?.length > 0 && (
                <p style={{ fontSize: "0.88rem", color: "#e53e3e", marginTop: 6 }}>
                  ⚠️ Weak subjects: {prediction.weak_subjects.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {/* Subject Scores Bar */}
            <div className="card">
              <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                Subject-wise Average Score
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={performance.map((p) => ({ name: p.subject, score: p.avgScore }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="score" fill="#4A90D9" radius={[4, 4, 0, 0]}
                    label={{ position: "top", fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="card">
              <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                Performance Radar
              </h2>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <Radar name="Score" dataKey="score" fill="#4A90D9" fillOpacity={0.4} stroke="#4A90D9" />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: "#718096", textAlign: "center", marginTop: 80 }}>
                  Attempt quizzes to see data
                </p>
              )}
            </div>
          </div>

          {/* Weekly line chart */}
          <div className="card">
            <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
              Weekly Study Completion (%) — Streak: 🔥 {streak} days
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData.map((d) => ({
                day: new Date(d.date).toLocaleDateString("en", { weekday: "short" }),
                rate: d.completionRate,
                time: d.totalStudyTime,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#4A90D9" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subject status cards */}
          {performance.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginTop: "1.5rem" }}>
              {performance.map((p) => (
                <div key={p.subject} className="card" style={{
                  borderTop: `3px solid ${p.status === "weak" ? "#fc8181" : p.status === "average" ? "#ed8936" : "#48bb78"}`
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.subject}</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#1E3A5F" }}>{p.avgScore}%</div>
                  <div style={{ fontSize: "0.8rem", color: "#718096" }}>{p.totalAttempts} attempts</div>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: 600, marginTop: 6, display: "inline-block",
                    padding: "2px 8px", borderRadius: 12,
                    background: p.status === "weak" ? "#fed7d7" : p.status === "average" ? "#feebc8" : "#c6f6d5",
                    color: p.status === "weak" ? "#c53030" : p.status === "average" ? "#c05621" : "#276749",
                  }}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
