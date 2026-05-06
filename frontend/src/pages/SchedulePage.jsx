import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchedule, completeSession, generateSchedule } from "../store/scheduleSlice";
import { FiCheck, FiClock, FiBook } from "react-icons/fi";
import toast from "react-hot-toast";

const PRIORITY_COLORS = { high: "#fed7d7", medium: "#feebc8", low: "#c6f6d5" };

export default function SchedulePage() {
  const dispatch = useDispatch();
  const { schedule, loading, generating } = useSelector((s) => s.schedule);

  useEffect(() => { dispatch(fetchSchedule()); }, [dispatch]);

  const handleComplete = async (sessionId) => {
    if (!schedule?._id) return;
    const res = await dispatch(completeSession({ scheduleId: schedule._id, sessionId }));
    if (completeSession.fulfilled.match(res)) toast.success("Session marked complete! ✅");
  };

  const completed = schedule?.sessions?.filter((s) => s.completed).length || 0;
  const total     = schedule?.sessions?.length || 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Today's Schedule</h1>
          <p style={{ color: "#718096" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => dispatch(generateSchedule())} disabled={generating}>
          {generating ? "Regenerating..." : "🤖 Regenerate"}
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Daily Progress</span>
            <span style={{ color: "#4A90D9", fontWeight: 700 }}>
              {completed}/{total} sessions ({Math.round((completed / total) * 100)}%)
            </span>
          </div>
          <div style={{ background: "#e2e8f0", borderRadius: 8, height: 10 }}>
            <div style={{
              width: `${(completed / total) * 100}%`, height: 10,
              background: "#4A90D9", borderRadius: 8, transition: "width 0.4s"
            }} />
          </div>
        </div>
      )}

      {/* Sessions */}
      {loading ? (
        <p style={{ color: "#718096" }}>Loading schedule...</p>
      ) : !schedule?.sessions?.length ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <FiBook size={40} color="#cbd5e0" style={{ marginBottom: 12 }} />
          <p style={{ color: "#718096" }}>No schedule yet. Click Regenerate to create one.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {schedule.sessions.map((session, i) => (
            <div key={session._id || i} className="card" style={{
              display: "flex", alignItems: "center", gap: "1rem",
              opacity: session.completed ? 0.6 : 1,
              borderLeft: `4px solid ${PRIORITY_COLORS[session.priority] || "#e2e8f0"}`,
            }}>
              {/* Time */}
              <div style={{ minWidth: 90, textAlign: "center" }}>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#4A90D9" }}>
                  {session.startTime}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#718096" }}>{session.endTime}</div>
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "1rem" }}>{session.subject}</div>
                <div style={{ fontSize: "0.85rem", color: "#718096" }}>{session.topic}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                  <FiClock size={12} color="#718096" />
                  <span style={{ fontSize: "0.78rem", color: "#718096" }}>{session.duration} min</span>
                  <span className={`badge badge-${session.priority}`}>{session.priority}</span>
                </div>
              </div>

              {/* Complete button */}
              {!session.completed ? (
                <button
                  className="btn btn-outline"
                  style={{ fontSize: "0.82rem", padding: "0.4rem 1rem" }}
                  onClick={() => handleComplete(session._id)}
                >
                  Mark Done
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#48bb78", fontWeight: 600 }}>
                  <FiCheck size={18} /> Done
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
