const jwt = require("jsonwebtoken");

// Verifikasi token dan tempel data user ke req.user
exports.protect = (req, res, next) => {
   const authHeader = req.headers.authorization;
   const token = authHeader?.split(" ")[1];

   if (!token) {
      return res.status(401).json({
         success: false,
         error: "Token tidak ditemukan",
      });
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // => bisa akses `req.user.role`
      next();
   } catch (err) {
      console.error("JWT verification error:", err);
      res.status(403).json({
         success: false,
         error: "Token tidak valid",
         detail: err.message,
      });
   }
};

// Cek apakah user role-nya admin
exports.protectAdmin = (req, res, next) => {
   if (req.user?.role !== "admin") {
      return res.status(403).json({
         success: false,
         error: "Akses khusus admin",
      });
   }
   next();
};

// Cek apakah user role-nya petugas atau admin
exports.protectPetugas = (req, res, next) => {
   if (req.user?.role !== "petugas" && req.user?.role !== "admin") {
      return res.status(403).json({
         success: false,
         error: "Akses hanya untuk petugas atau admin",
      });
   }
   next();
};