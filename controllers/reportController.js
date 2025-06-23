const Report = require("../models/Report");
const { validationResult } = require("express-validator");

// POST laporan
exports.createReport = async (req, res) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
   }

   try {
      const imagePaths = req.files?.map((file) => `/uploads/${file.filename}`) || [];

      const reportData = {
         title: req.body.title,
         category: req.body.category,
         priority: req.body.priority,
         description: req.body.description,
         location: req.body.location,
         reporter: req.firebaseUser.name || req.firebaseUser.displayName || "Anonim",
         reporterEmail: req.firebaseUser.email,
         reporterUid: req.firebaseUser.uid,
         images: imagePaths,
         status: req.body.status || "baru",
         timeline: [{
            date: new Date(),
            status: "baru",
            description: "Laporan dibuat",
            officer: req.firebaseUser.name || req.firebaseUser.displayName || "Pelapor",
         }],
      };

      const report = new Report(reportData);
      const savedReport = await report.save();

      res.status(201).json({
         success: true,
         message: "Laporan berhasil dibuat",
         data: savedReport,
      });
   } catch (err) {
      console.error("Error creating report:", err);
      res.status(500).json({
         success: false,
         error: "Gagal membuat laporan",
         details: err.message,
      });
   }
};

// GET semua laporan
exports.getReports = async (req, res) => {
   try {
      const reports = await Report.find().sort({ createdAt: -1 });
      res.json({
         success: true,
         data: reports,
      });
   } catch (err) {
      console.error("Error fetching reports:", err);
      res.status(500).json({
         success: false,
         error: "Gagal mengambil laporan",
      });
   }
};

// GET laporan berdasarkan user UID
exports.getUserReports = async (req, res) => {
   try {
      const { uid } = req.params;

      // Pastikan user hanya bisa mengakses laporan mereka sendiri
      if (req.firebaseUser.uid !== uid) {
         return res.status(403).json({
            success: false,
            error: "Akses ditolak",
         });
      }

      const reports = await Report.find({ reporterUid: uid }).sort({ createdAt: -1 });

      res.json({
         success: true,
         data: reports,
      });
   } catch (err) {
      console.error("Error fetching user reports:", err);
      res.status(500).json({
         success: false,
         error: "Gagal mengambil laporan user",
      });
   }
};

// GET laporan berdasarkan ID
exports.getReportById = async (req, res) => {
   try {
      const report = await Report.findById(req.params.id);

      if (!report) {
         return res.status(404).json({
            success: false,
            error: "Laporan tidak ditemukan",
         });
      }

      res.json({
         success: true,
         data: report,
      });
   } catch (err) {
      console.error("Error fetching report:", err);
      res.status(500).json({
         success: false,
         error: "Gagal mengambil laporan",
      });
   }
};

// PUT update laporan (oleh petugas)
exports.updateReport = async (req, res) => {
   const reportId = req.params.id;
   const { status, response } = req.body;

   try {
      const report = await Report.findById(reportId);
      if (!report) {
         return res.status(404).json({
            success: false,
            error: "Laporan tidak ditemukan",
         });
      }

      // Update status jika ada
      if (status) report.status = status;

      // Update response jika ada
      if (response) report.response = response;

      // Set officer info dari JWT token (untuk admin/petugas)
      report.officer = req.user?.name || "Petugas";
      report.officerEmail = req.user?.email || "";

      // Tambahkan entry ke timeline
      report.timeline.push({
         date: new Date(),
         status: status || report.status,
         description: response || "Update status",
         officer: report.officer,
      });

      const updatedReport = await report.save();

      res.json({
         success: true,
         message: "Laporan berhasil diupdate",
         data: updatedReport,
      });
   } catch (err) {
      console.error("Error updating report:", err);
      res.status(500).json({
         success: false,
         error: "Gagal update laporan",
      });
   }
};

// DELETE laporan
exports.deleteReport = async (req, res) => {
   try {
      const report = await Report.findById(req.params.id);

      if (!report) {
         return res.status(404).json({
            success: false,
            error: "Laporan tidak ditemukan",
         });
      }

      await Report.findByIdAndDelete(req.params.id);

      res.json({
         success: true,
         message: "Laporan berhasil dihapus",
      });
   } catch (err) {
      console.error("Error deleting report:", err);
      res.status(500).json({
         success: false,
         error: "Gagal menghapus laporan",
      });
   }
};