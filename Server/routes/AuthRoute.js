const express = require("express");
const router = express.Router();
const {
  signUp,
  logIn,
  getUserInfo,
  logOut,
  githubAuth,
  githubCallback,
  linkedinAuth,
  linkedinCallback,
} = require("../controllers/AuthController.js");
const verifyToken = require("../middlewares/AuthMiddleware.js");

router.post("/signup", signUp);
router.post("/login", logIn);
router.get("/userInfo", verifyToken, getUserInfo);
router.post("/logout", logOut);
router.get("/github", require("../controllers/AuthController").githubAuth);
router.get(
  "/github/callback",
  require("../controllers/AuthController").githubCallback
);
router.get("/linkedin", linkedinAuth);
router.get("/linkedin/callback", linkedinCallback);

module.exports = router;
