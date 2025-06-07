const User = require("../models/UserModel");
const { renameSync, unlinkSync } = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const updateProfile = async (req, res) => {
  try {
    const { id } = req;
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    const userData = await User.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      id: userData._id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileSetup: userData.profileSetup,
      image: userData.image,
    });
  } catch (err) {
    // console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please provide an image" });
    }

    const userId = req.id;
    const user = await User.findById(userId);

    //if already have a profile pic then we will first delete that
    if (user.cloudinary_id) {
      await cloudinary.uploader.destroy(user.cloudinary_id);
    }

    //upload new image to cloudinary
    const cloudinaryResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "profile-images",
          public_id: userId,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    user.image = cloudinaryResponse.secure_url;
    await user.save();
    console.log("Cloudinary link: ", cloudinaryResponse.secure_url);
    return res.status(200).json({
      image: user.image,
    });
  } catch (err) {
    // console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteImage = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);
    if (!user.image) {
      console.log("No image found");
      return res.status(400).json({ error: "No image found" });
    }

    await cloudinary.uploader.destroy(`profile-images/${userId}`);

    user.image = null;
    await user.save();

    return res.status(200).send("Profile image deleted");
  } catch (err) {
    // console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateProfile, uploadImage, deleteImage };
