const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/AuthMiddleware');
const multer = require('multer');
const {
  updateProfile,
  uploadImage,
  deleteImage,
} = require("../controllers/profileController");
const upload = require('../middlewares/upload');

router.post('/update-profile', verifyToken, updateProfile);
router.post('/upload-image', verifyToken, upload.single('profile-image'), uploadImage);
router.post('/delete-image', verifyToken, deleteImage);
module.exports = router;