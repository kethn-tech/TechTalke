import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/store';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Users as Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Users = () => {
  const { userInfo } = useStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    // Check if user is admin
    if (!userInfo || userInfo.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/chat");
      return;
    }

    fetchUsers();
  }, [userInfo, navigate, pagination.page, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/admin/users", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchQuery,
        },
      });

      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    // The useEffect will trigger the API call
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await apiClient.delete(`/api/admin/users/${selectedUser._id}`);
      toast.success("User deleted successfully");
      setShowDeleteDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      await apiClient.put("/api/admin/users/update-role", {
        userId: selectedUser._id,
        role: selectedRole,
      });
      toast.success(`User role updated to ${selectedRole}`);
      setShowRoleDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(
        error.response?.data?.message || "Failed to update user role"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 text-transparent bg-clip-text mb-2">
              User Management
            </h1>
            <p className="text-gray-400">
              View and manage all users in the system
            </p>
          </div>
          <Button
            variant="outline"
            className=" bg-gray-900 text-slate-200  hover:bg-dark-accent/30 border border-dark-accent/30"
            onClick={() => navigate("/admin/dashboard")}
          >
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-dark-accent/10 border-dark-accent/30 text-dark-text placeholder:text-dark-muted"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-accent/20 backdrop-blur-sm rounded-xl border border-dark-accent/30 overflow-hidden"
        >
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-dark-accent/30 bg-dark-accent/10">
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-dark-accent/10 hover:bg-dark-accent/10"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            {user.firstName?.charAt(0) ||
                              user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.email.split("@")[0]}
                            </div>
                            <div className="text-xs text-gray-400">
                              {user.profileSetup
                                ? "Profile Complete"
                                : "Profile Incomplete"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.role === "admin"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2  bg-gray-900 text-slate-200  hover:bg-dark-accent/30 border border-dark-accent/30"
                              >
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-dark-secondary border-dark-accent/30 text-dark-text">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSelectedRole(user.role);
                                  setShowRoleDialog(true);
                                }}
                                className="cursor-pointer hover:bg-dark-accent/20"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>
                              {userInfo._id !== user._id && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="cursor-pointer hover:bg-dark-accent/20 text-red-400"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  No users found
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && users.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-dark-accent/30 bg-dark-accent/10">
              <div className="text-sm text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="h-8 px-2 hover:bg-dark-accent/30 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="h-8 px-2 hover:bg-dark-accent/30 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-dark-primary border-dark-accent/30 text-dark-text">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-accent/10">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  {selectedUser.firstName?.charAt(0) ||
                    selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">
                    {selectedUser.firstName && selectedUser.lastName
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.email.split("@")[0]}
                  </div>
                  <div className="text-sm text-gray-400">
                    {selectedUser.email}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="hover:bg-dark-accent/30 border border-dark-accent/30 text-slate-200 bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="bg-dark-primary border-dark-accent/30 text-dark-text">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select a new role for this user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-accent/10 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  {selectedUser.firstName?.charAt(0) ||
                    selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">
                    {selectedUser.firstName && selectedUser.lastName
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.email.split("@")[0]}
                  </div>
                  <div className="text-sm text-gray-400">
                    {selectedUser.email}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 ">
              <Button
                variant={selectedRole === "user" ? "default" : "outline"}
                className={
                  selectedRole === "user"
                    ? "bg-green-600 hover:bg-green-700"
                    : "hover:bg-dark-accent/30 text-slate-950 "
                }
                onClick={() => setSelectedRole("user")}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                User
              </Button>
              <Button
                variant={selectedRole === "admin" ? "default" : "outline"}
                className={
                  selectedRole === "admin"
                    ? "bg-red-600 hover:bg-red-700"
                    : "hover:bg-dark-accent/30 text-slate-950"
                }
                onClick={() => setSelectedRole("admin")}
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRoleDialog(false)}
              className="hover:bg-dark-accent/30 bg-gray-800 border border-dark-accent/30 text-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              className="bg-blue-600 hover:bg-blue-700"
              onkeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdateRole();
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;