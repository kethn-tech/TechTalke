import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/store';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
const Messages = () => {
  const { userInfo } = useStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Check if user is admin or moderator
    if (!userInfo || userInfo.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/chat");
      return;
    }

    fetchMessages();
  }, [userInfo, navigate, pagination.page]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/admin/messages", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });

      setMessages(response.data.messages);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatMessagePreview = (content) => {
    if (!content) return "No content";

    // Handle different message types (text, image, etc.)
    if (typeof content === "object" && content.type) {
      switch (content.type) {
        case "code":
          return "[Code Snippet]";
        default:
          return content.text || "Unknown content";
      }
    }

    // Plain text message
    return content.length > 100 ? `${content.substring(0, 100)}...` : content;
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
              Message Moderation
            </h1>
            <p className="text-gray-400">
              Review and moderate messages across the platform
            </p>
          </div>
          <Button
            variant="outline"
            className="hover:bg-dark-accent/30  text-slate-200 bg-gray-900 border border-dark-accent/30"
            onClick={() => navigate("/admin/dashboard")}
          >
            Back to Dashboard
          </Button>
        </motion.div>
        Messages Table
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
                    <th className="px-6 py-3">Sender</th>
                    <th className="px-6 py-3">Recipient</th>
                    <th className="px-6 py-3">Content</th>
                    <th className="px-6 py-3">Sent At</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr
                      key={message._id}
                      className="border-b border-dark-accent/10 hover:bg-dark-accent/10"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            {message.sender?.firstName?.charAt(0) ||
                              message.sender?.email?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                          <div>
                            <div className="font-medium">
                              {message.sender?.firstName &&
                              message.sender?.lastName
                                ? `${message.sender.firstName} ${message.sender.lastName}`
                                : message.sender?.email?.split("@")[0] ||
                                  "Unknown"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {message.sender?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            {message.recipient?.firstName?.charAt(0) ||
                              message.recipient?.name?.charAt(0) ||
                              message.recipient?.email
                                ?.charAt(0)
                                ?.toUpperCase() ||
                              "?"}
                          </div>
                          <div>
                            <div className="font-medium">
                              {message.recipient?.firstName &&
                              message.recipient?.lastName
                                ? `${message.recipient.firstName} ${message.recipient.lastName}`
                                : message.recipient?.name ||
                                  message.recipient?.email?.split("@")[0] ||
                                  "Unknown"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {message.recipient?.name
                                ? "Group"
                                : "Direct Message"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {formatMessagePreview(message.content)}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(message.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowDeleteDialog(true);
                          }}
                          className="h-8 px-2 hover:bg-dark-accent/30 text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {messages.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  No messages found
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && messages.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-dark-accent/30 bg-dark-accent/10">
              <div className="text-sm text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} messages
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
    </div>
  );
};

export default Messages;
