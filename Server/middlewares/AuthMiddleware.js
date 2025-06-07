const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Get token from cookies or Authorization header
    const cookieToken = req.cookies.token;
    const headerToken = req.headers.authorization?.startsWith('Bearer ') 
      ? req.headers.authorization.split(' ')[1] 
      : null;
    
    const token = cookieToken || headerToken;
    
    console.log("Cookies received:", req.cookies);
    console.log("Auth header:", req.headers.authorization);
    console.log("Token being used:", token);
    
    if (!token) {
      console.log("No token provided in request");
      return res.status(401).json({
        error: "You are not authenticated"
      });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      
      // Set both req.id for backward compatibility and req.user object for AdminController
      req.id = decoded.id;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role // Add role to the user object
      };
      
      console.log("Decoded token:", decoded);
      console.log("User object set:", req.user);
      
      next();
    } catch (err) {
      console.error("Token verification failed:", err.message);
      res.clearCookie("token", {
        httpOnly: true, 
        secure: false, 
        sameSite: "lax"
      });
      return res.status(403).json({
        error: "Token is not valid"
      });
    }
};

module.exports = verifyToken;