import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loadUser } from "./store/authSlice";

import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SchedulePage  from "./pages/SchedulePage";
import QuizPage      from "./pages/QuizPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ChatPage      from "./pages/ChatPage";
import ProfilePage   from "./pages/ProfilePage";
import Layout        from "./components/common/Layout";

const PrivateRoute = ({ children }) => {
  const { token } = useSelector((s) => s.auth);
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index           element={<DashboardPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="quiz"     element={<QuizPage />} />
        <Route path="analytics"element={<AnalyticsPage />} />
        <Route path="chat"     element={<ChatPage />} />
        <Route path="profile"  element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
