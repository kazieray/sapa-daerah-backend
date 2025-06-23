const express = require("express");
const router = express.Router();
const { createReport, getReports, getUserReports, getReportById, updateReport, deleteReport } = require("../controllers/reportController");
const { protect, protectPetugas } = require("../middleware/authJWT");
const { body } = require("express-validator");
const upload = require("../utils/upload");
const verifyFirebaseToken = require("../middleware/firebaseAuth");

// Validasi input form (anti XSS) - menggunakan field names backend
const reportValidation = [
   body("title").notEmpty().withMessage("Judul wajib diisi"),
   body("description").notEmpty().withMessage("Deskripsi wajib diisi"),
   body("category").notEmpty().withMessage("Kategori wajib diisi"),
   body("location").notEmpty().withMessage("Lokasi wajib diisi"),
   body("priority").isIn(["rendah", "sedang", "tinggi"]).withMessage("Prioritas tidak valid"),
   body("status").optional().isIn(["baru", "diproses", "selesai", "ditolak"]),
];

// Routes dengan urutan yang benar - specific routes first
// GET semua laporan (public)
router.get("/", getReports);

// GET laporan berdasarkan user UID (Firebase auth required)
router.get("/user/:uid", verifyFirebaseToken, getUserReports);

// GET laporan berdasarkan ID (Firebase auth required)
router.get("/:id", verifyFirebaseToken, getReportById);

// POST laporan baru (Firebase auth required)
router.post("/", verifyFirebaseToken, upload.array("images", 3), reportValidation, createReport);

// PUT update laporan (JWT auth required - admin/petugas only)
router.put("/:id", protect, protectPetugas, updateReport);

// DELETE laporan (JWT auth required - admin/petugas only)
router.delete("/:id", protect, protectPetugas, deleteReport);

module.exports = router;