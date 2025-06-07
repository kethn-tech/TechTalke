import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Trash2, Mail, User, UserCircle2 } from "lucide-react";
import { MdCancel } from "react-icons/md";
const Profile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [hovered, setHovered] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { userInfo, setUserInfo } = useStore();

  useEffect(() => {
    if (userInfo) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
    }

    if (userInfo.image) {
      setImage(userInfo.image);
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstName || !lastName) {
      toast.error("Please fill in all fields");
      return false;
    }
    return true;
  };

  const updateProfile = async () => {
    if (!validateProfile()) return;
    setLoading(true);

    try {
      const response = await apiClient.post(
        "/api/update-profile",
        { firstName, lastName },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data) {
        setUserInfo({ ...response.data });
        toast.success("Profile updated successfully");
        navigate("/chat");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("profile-image", file);

      try {
        const response = await apiClient.post("/api/upload-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (response.status === 200 && response.data.image) {
          setUserInfo({ ...userInfo, image: response.data.image });
          toast.success("Profile picture updated");
          setImage(response.data.image);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload image");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteImage = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        "/api/delete-image",
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        setImage(null);
        toast.success("Profile picture removed");
      }
    } catch (error) {
      toast.error("Failed to remove profile picture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white/90 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-gray-900 border-gray-800">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-12">
              {/* Left Column - Avatar */}
              <div className="flex flex-col items-center space-y-6">
                <div
                  className="relative group"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Avatar className="w-48 h-48 rounded-full ring-4 ring-blue-500/20 bg-gray-800 hover:ring-blue-500/40 transition-all duration-300 flex justify-center items-center overflow-hidden">
                      {image ? (
                        <AvatarImage
                          src={image}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="text-6xl text-blue-400/60 flex items-center justify-center">
                          <UserCircle2 className="w-24 h-24" />
                        </div>
                      )}
                    </Avatar>
                  </motion.div>

                  {/* Overlay Controls */}
                  <AnimatePresence>
                    {hovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center gap-4"
                      >
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="p-3 bg-blue-500/20 rounded-full hover:bg-blue-500/30 transition-colors"
                          onClick={handleFileInputClick}
                        >
                          <Camera className="w-6 h-6 text-blue-400" />
                        </motion.button>
                        {image && (
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="p-3 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors"
                            onClick={handleDeleteImage}
                          >
                            <Trash2 className="w-6 h-6 text-red-400" />
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                    name="profile-image"
                    accept="image/*"
                  />
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-white">
                    {firstName && lastName
                      ? `${firstName} ${lastName}`
                      : "Complete Your Profile"}
                  </h2>
                  <p className="text-sm text-gray-400">{userInfo?.email}</p>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="flex-1 space-y-8">
                <div className="space-y-6">
                  <MdCancel
                    className="absolute top-4 right-0.5 text-2xl cursor-pointer text-dark-muted opacity-0 hover:opacity-100 hover:text-blue-400 transition-opacity duration-300"
                    onClick={() => (window.location.href = "/chat")}
                  />
                  <h3 className="text-2xl font-bold text-white">
                    Profile Information
                  </h3>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm text-gray-400">
                        Email Address
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                        <Input
                          id="email"
                          className="pl-10 bg-gray-800/50 border-gray-700 text-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                          value={userInfo?.email}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-sm text-gray-400"
                      >
                        First Name
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                        <Input
                          id="firstName"
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                          placeholder="Enter your first name"
                          value={firstName || ""}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-sm text-gray-400"
                      >
                        Last Name
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                        <Input
                          id="lastName"
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                          placeholder="Enter your last name"
                          value={lastName || ""}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-200"
                    onClick={updateProfile}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;
