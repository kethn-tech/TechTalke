import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/store';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Users, UserCog, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { userInfo } = useStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!userInfo || userInfo.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/chat");
      return;
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/api/admin/dashboard-stats");
        setStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userInfo, navigate]);

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: <Users className="h-8 w-8 text-blue-500" />,
      color: "from-blue-500 to-blue-600",
      onClick: () => navigate("/admin/users"),
    },
  ];

  const adminActions = [
    {
      title: "Manage Users",
      description: "View, edit roles, and manage user accounts",
      icon: <UserCog className="h-6 w-6" />,
      onClick: () => navigate("/admin/users"),
    },
    {
      title: "Return to Chat",
      description: "Go back to the main chat interface",
      icon: <Shield className="h-6 w-6" />,
      onClick: () => navigate("/chat"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 text-transparent bg-clip-text mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Manage users and monitor system activity
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={card.onClick}
              className="bg-dark-accent/30 backdrop-blur-sm rounded-xl p-6 border border-dark-accent/30 hover:border-blue-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{card.title}</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {loading ? "..." : card.value}
                  </h3>
                </div>
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${card.color} bg-opacity-10`}
                >
                  {card.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-accent/20 backdrop-blur-sm rounded-xl p-6 border border-dark-accent/30 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Recent Users
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-dark-accent/30">
                    <th className="pb-2">User</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentUsers?.map((user, index) => (
                    <tr
                      key={index}
                      className="border-b border-dark-accent/10 hover:bg-dark-accent/10"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            {user.firstName?.charAt(0) ||
                              user.email.charAt(0).toUpperCase()}
                          </div>
                          <span>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email.split("@")[0]}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-400">{user.email}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.role === "admin"
                              ? "bg-red-500/20 text-red-400"
                              : user.role === "moderator"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                <div className="text-center py-4 text-gray-400">
                  No users found
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full text-slate-200 bg-gray-900 hover:bg-dark-accent/30 border border-dark-accent/30 "
              onClick={() => navigate("/admin/users")}
            >
              All Users
            </Button>
          </div>
        </motion.div>

        {/* Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {adminActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={action.onClick}
              className="bg-dark-accent/20 backdrop-blur-sm rounded-xl p-6 border border-dark-accent/30 hover:border-blue-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;