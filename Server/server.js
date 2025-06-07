const express = require('express');
const dbConnect = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const AuthRoute = require('./routes/AuthRoute');
const ContactRoutes = require('./routes/ContactRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileRoute = require("./routes/profileRoute");
const adminRoutes = require('./routes/adminRoutes');
const setupSocket = require('./socket');
const http = require('http');
const path = require('path');

require('dotenv').config();
//console.log("JWT_KEY in server:", process.env.JWT_KEY);
const app = express();

// Configure express middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS with specific settings
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Cookie",
  ],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
  
  app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Fix the static file serving
app.use("/uploads/profile-images", express.static(path.join(__dirname, "uploads/profile-images")));

// Create the uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads/profile-images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Add headers to all responses to ensure CORS works properly
// app.use((req, res, next) => {
//     const origin = req.headers.origin;
//     if (origin === 'http://localhost:3000' || origin === 'http://localhost:5173' || origin === 'http://localhost:5174') {
//         res.header('Access-Control-Allow-Origin', origin);
//     }
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cookie, Set-Cookie');
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header('Access-Control-Expose-Headers', 'Set-Cookie');
//     next();
// });

app.use('/api/auth', AuthRoute);
app.use('/api', profileRoute);
app.use('/api/contact', ContactRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/admin', adminRoutes);
app.get("/", (req, res) => {
  res.send("TechTalke API is running!");
});

const server = http.createServer(app);
setupSocket(server);

dbConnect();

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})