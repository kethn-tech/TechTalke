import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminUsers from "./pages/Admin/Users";
import AdminMessages from "./pages/Admin/Messages";
import { useStore } from "@/store/store";
import apiClient from "./lib/apiClient";
import Loader from "./pages/Loader";

const ProtectedRoutes = ({ children }) => {
  const { userInfo } = useStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AuthRoutes = ({ children }) => {
  const { userInfo } = useStore();
  const isAuthenticated = !!userInfo;
  const profile = userInfo?.profileSetup;
  return isAuthenticated ? (
    profile ? (
      <Navigate to="/chat" />
    ) : (
      <Navigate to="/profile" />
    )
  ) : (
    children
  );
};

const App = () => {
  const { userInfo, setUserInfo } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get("/api/auth/userInfo", {
          withCredentials: true,
        });
        if (response.data.user) {
          setUserInfo(response.data.user);
        } else {
          setUserInfo(undefined);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUserInfo(undefined);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo === undefined) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);

  if (loading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthRoutes>
              <Auth />
            </AuthRoutes>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoutes>
              <Chat />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoutes>
              <Profile />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoutes>
              <AdminDashboard />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoutes>
              <AdminUsers />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoutes>
              <AdminMessages />
            </ProtectedRoutes>
          }
        />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;