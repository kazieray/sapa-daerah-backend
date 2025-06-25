const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");

dotenv.config();
const app = express();

// CORS configuration - Updated for development
const corsOptions = {
   origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
         "https://sapadaerah.netlify.app", // Production frontend
         "http://localhost:5173", // Local development frontend
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
         callback(null, true);
      } else {
         console.log("Blocked by CORS:", origin);
         callback(new Error("Not allowed by CORS"));
      }
   },
   credentials: true, // Allow cookies
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
   allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "x-csrf-token"],
};

app.use(cors(corsOptions));

connectDB();

// --- Middleware Umum ---
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// GraphQL endpoint - TANPA CSRF protection
app.use(
   "/graphql",
   graphqlHTTP({
      schema,
      graphiql: true,
   })
);

// --- CSRF Protection - Conditional ---
// Only enable CSRF for same-origin requests or disable for development
const csrfProtection = csrf({
   cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
   },
   // Skip CSRF for cross-origin requests in development
   ignoreMethods: process.env.NODE_ENV === "development" ? ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE"] : ["GET", "HEAD", "OPTIONS"],
});

// Apply CSRF conditionally
if (process.env.NODE_ENV === "production") {
   app.use(csrfProtection);
}

// --- Routes ---
app.get("/", (req, res) => {
   res.send("SAPA Daerah Backend Aktif 🔥");
});

// CSRF token endpoint - conditional
app.get("/api/csrf-token", (req, res) => {
   if (process.env.NODE_ENV === "production") {
      res.json({ csrfToken: req.csrfToken() });
   } else {
      // Return dummy token for development
      res.json({ csrfToken: "dev-token" });
   }
});

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));