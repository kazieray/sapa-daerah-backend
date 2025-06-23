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

// CORS configuration
app.use(
   cors({
      origin: "https://sapadaerah.netlify.app", // frontend URL
      credentials: true, // izinkan cookie terkirim
   })
);

connectDB();

// --- Middleware Umum ---
app.use(express.json({ limit: "5mb" })); // batasi ukuran input (cegah XSS besar)
app.use(cookieParser()); // parsing cookie
app.use("/uploads", express.static("uploads"));

// GraphQL endpoint - TANPA CSRF protection
app.use(
   "/graphql",
   graphqlHTTP({
      schema,
      graphiql: true, // Biar bisa coba-coba di browser
   })
);

// --- Middleware CSRF untuk routes lainnya ---
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// --- Routes ---
app.get("/", (req, res) => {
   res.send("SAPA Daerah Backend Aktif 🔥");
});

// Kirim CSRF token ke frontend saat diminta
app.get("/api/csrf-token", (req, res) => {
   res.json({ csrfToken: req.csrfToken() });
});

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));