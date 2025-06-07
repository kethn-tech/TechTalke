const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        Error: "Please provide an email and password",
      });
    }

    const data = await User.create({ email, password });

    const token = jwt.sign(
      { email: data.email, id: data._id.toString(), role: data.role },
      process.env.JWT_KEY,
      { expiresIn: "3d" }
    );

    // Set cookie with appropriate settings for development
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    });

    return res.status(201).json({
      user: data,
    });
  } catch (err) {
    return res.status(500).json({
      "Internal Server Error": err,
    });
  }
};

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        Error: "Please provide an email and password",
      });
    }

    const data = await User.findOne({ email });

    if (!data) {
      return res.status(400).json({
        Error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, data.password);

    if (!isMatch) {
      return res.status(400).json({
        Error: "Wrong Password",
      });
    }

    const token = jwt.sign(
      { email: data.email, id: data._id.toString(), role: data.role },
      process.env.JWT_KEY,
      { expiresIn: "3d" }
    );

    // Set cookie with appropriate settings for development
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    });

    return res.status(200).json({
      user: data,
    });
  } catch (err) {
    return res.status(500).json({
      "Internal Server Error": err,
    });
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    // Add console log to debug the user ID
    console.log("User ID from middleware: ", req.id);

    const user = await User.findById(req.id);
    if (!user) {
      console.log("No user found with ID:", req.id);
      return res.status(404).json({
        Error: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (err) {
    console.error("Error in getUserInfo:", err);
    return res.status(500).json({
      "Internal Server Error": err.message,
    });
  }
};

const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Logged Out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      "Internal Server Error": err,
    });
  }
};
const githubAuth = (req, res) => {
  const redirectUri = encodeURIComponent(
    "http://localhost:4000/api/auth/github/callback"
  );
  const clientId = process.env.GITHUB_CLIENT_ID;
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  res.redirect(githubUrl);
};

// Step 2: Handle GitHub OAuth callback
const githubCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );
    const accessToken = tokenRes.data.access_token;

    // Get user info from GitHub
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });

    const emailRes = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `token ${accessToken}` },
    });

    // Prefer primary email
    const emailObj = emailRes.data.find((e) => e.primary) || emailRes.data[0];
    const email = emailObj.email;

    // Find or create user in your DB
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        password: "", // Or null, since password not needed for OAuth
        githubId: userRes.data.id, // Add this field to your User model!
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, id: user._id.toString(), role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "3d" }
    );

    // Set cookie and redirect to frontend (adjust URL as needed)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    // Redirect to your frontend app (adjust URL as needed)
    res.redirect("http://localhost:5173/auth/"); // or /dashboard, etc.
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "GitHub OAuth failed" });
  }
};

// Step 1: Redirect to LinkedIn OAuth
const linkedinAuth = (req, res) => {
  const redirectUri = encodeURIComponent(
    "http://localhost:4000/api/auth/linkedin/callback"
  );
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const state = "randomstatestring"; // For CSRF protection, use a real random string in production
  const scope = "openid profile email";
  const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${encodeURIComponent(
    scope
  )}`;
  res.redirect(linkedinUrl);
};

// Step 2: Handle LinkedIn Callback
const linkedinCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    console.error("No code in callback!");
    return res.status(400).send("No code provided in callback.");
  }

  const redirectUri = "http://localhost:4000/api/auth/linkedin/callback";
  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const accessToken = tokenRes.data.access_token;

    // Fetch user profile
    const userInfo = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const email = userInfo.data.email;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        password: "", // or null
        linkedinId: profileRes.data.id, // Add this field to your User model!
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, id: user._id.toString(), role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "3d" }
    );

    // Set cookie and redirect to frontend
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:5173/"); // Or your frontend dashboard
  } catch (err) {
    console.error(
      "LinkedIn OAuth error:",
      err.response?.data || err.message || err
    );
    res.status(500).json({
      error: "LinkedIn OAuth failed",
      details: err.response?.data || err.message || err,
    });
  }
};

module.exports = {
  signUp,
  logIn,
  getUserInfo,
  logOut,
  githubAuth,
  githubCallback,
  linkedinAuth,
  linkedinCallback,
};



