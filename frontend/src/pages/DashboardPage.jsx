import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchSchedule, generateSchedule } from "../store/scheduleSlice";
import { fetchWeekly } from "../store/analyticsSlice";
import { FiCalendar, FiBarChart2, FiZap, FiAward } from "react-icons/fi";
import { FaBrain } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);
  const { schedule, generating } = useSelector((s) => s.schedule);
  const { weeklyData, streak }   = useSelector((s) => s.analytics);

  useEffect(() => {
    dispatch(fetchSchedule());
    dispatch(fetchWeekly());
  }, [dispatch]);

  const handleGenerate = async () => {
    const res = await dispatch(generateSchedule());
    if (generateSchedule.fulfilled.match(res)) {
      toast.success("AI schedule generated! 🤖");
    } else {
      toast.error("Generation failed");
    }
  };

  const todayCompleted = schedule?.sessions?.filter((s) => s.completed).length || 0;
  const todayTotal     = schedule?.sessions?.length || 0;
  const completionPct  = todayTotal ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  const stats = [
    { label: "Today's Sessions", value: `${todayCompleted}/${todayTotal}`, icon: FiCalendar, color: "#4A90D9" },
    { label: "Completion",        value: `${completionPct}%`,              icon: FiBarChart2, color: "#48bb78" },
    { label: "Streak",            value: `${streak} days`,                 icon: FiZap,       color: "#ed8936" },
    { label: "Points",            value: user?.totalPoints || 0,           icon: FiAward,     color: "#9f7aea" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1E3A5F" }}>
          Good morning, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "#718096" }}>Here's your study overview for today.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12,
              background: color + "20", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1E3A5F" }}>{value}</div>
              <div style={{ fontSize: "0.8rem", color: "#718096" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Generate + Today's Schedule */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Generate */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
            <FaBrain size={22} color="#4A90D9" />
            <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>AI Schedule Generator</h2>
          </div>
          <p style={{ color: "#718096", fontSize: "0.9rem", marginBottom: "1.2rem" }}>
            Generate a personalized schedule using Reinforcement Learning based on your quiz scores and weak subjects.
          </p>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "🤖 Generate Today's Schedule"}
          </button>
          {schedule && (
            <button className="btn btn-outline" onClick={() => navigate("/schedule")}
              style={{ marginLeft: 10 }}>
              View Schedule
            </button>
          )}
        </div>

        {/* Weekly Chart */}
        <div className="card">
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
            Weekly Completion Rate
          </h2>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData.map((d) => ({
                day: new Date(d.date).toLocaleDateString("en", { weekday: "short" }),
                rate: d.completionRate,
              }))}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" fill="#4A90D9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "#718096", fontSize: "0.9rem", textAlign: "center", marginTop: 50 }}>
              No data yet. Complete sessions to see your progress.
            </p>
          )}
        </div>
      </div>

      {/* Today's Sessions Preview */}
      {schedule?.sessions?.length > 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
            Today's Sessions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
            {schedule.sessions.slice(0, 6).map((session, i) => (
              <div key={i} style={{
                padding: "0.75rem 1rem", borderRadius: 8,
                background: session.completed ? "#f0fff4" : "#f7fafc",
                border: `1px solid ${session.completed ? "#c6f6d5" : "#e2e8f0"}`,
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{session.subject}</div>
                  <div style={{ fontSize: "0.78rem", color: "#718096" }}>
                    {session.startTime} – {session.endTime}
                  </div>
                </div>
                <span className={`badge badge-${session.priority}`}>{session.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
