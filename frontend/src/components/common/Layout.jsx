import React, { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { connectSocket, disconnectSocket } from "../../services/socket";
import {
  FiHome, FiCalendar, FiBarChart2, FiMessageCircle,
  FiUser, FiLogOut, FiBook
} from "react-icons/fi";
import { FaBrain } from "react-icons/fa";

const navItems = [
  { to: "/",          icon: FiHome,          label: "Dashboard"  },
  { to: "/schedule",  icon: FiCalendar,      label: "Schedule"   },
  { to: "/quiz",      icon: FiBook,          label: "Quiz"       },
  { to: "/analytics", icon: FiBarChart2,     label: "Analytics"  },
  { to: "/chat",      icon: FiMessageCircle, label: "AI Chat"    },
  { to: "/profile",   icon: FiUser,          label: "Profile"    },
];

export default function Layout() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((s) => s.auth);

  useEffect(() => {
    if (user?._id) {
      const socket = connectSocket(user._id);
      socket.on("session_reminder", (data) => {
        // toast or browser notification handled in socket.js
      });
    }
    return () => disconnectSocket();
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: "#1E3A5F", color: "#fff",
        display: "flex", flexDirection: "column", padding: "1.5rem 0",
        position: "fixed", height: "100vh", zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 1.5rem 2rem" }}>
          <FaBrain size={28} color="#4A90D9" />
          <span style={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.2 }}>AI Study<br/>Planner</span>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 12,
                padding: "0.75rem 1.5rem",
                color: isActive ? "#4A90D9" : "#a0aec0",
                background: isActive ? "rgba(74,144,217,0.12)" : "transparent",
                textDecoration: "none", fontSize: "0.9rem", fontWeight: 500,
                borderLeft: isActive ? "3px solid #4A90D9" : "3px solid transparent",
                transition: "all 0.2s",
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: "0 1.5rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#718096", marginBottom: 8 }}>
            {user?.name}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "transparent", border: "none", color: "#fc8181",
              cursor: "pointer", fontSize: "0.9rem", padding: "0.5rem 0"
            }}
          >
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: "2rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
