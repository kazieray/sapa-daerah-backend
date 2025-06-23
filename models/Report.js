const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema({
   date: { type: Date, default: Date.now },
   status: { type: String, enum: ["baru", "diproses", "selesai", "ditolak"] },
   description: String,
   officer: String,
});

const reportSchema = new mongoose.Schema(
   {
      title: { type: String, required: true },
      category: { type: String, required: true },
      priority: { type: String, enum: ["rendah", "sedang", "tinggi"], required: true },
      description: { type: String, required: true },
      location: { type: String, required: true },
      images: [{ type: String }], // Array of file paths
      reporter: { type: String, required: true },
      reporterEmail: { type: String, required: true },
      reporterUid: { type: String, required: true }, // Firebase UID
      status: { type: String, enum: ["baru", "diproses", "selesai", "ditolak"], default: "baru" },
      timeline: [timelineSchema],
      response: { type: String, default: "" },
      officer: { type: String, default: "" }, // Petugas yang menangani
      officerEmail: { type: String, default: "" },
   },
   {
      timestamps: true, // Otomatis menambahkan createdAt & updatedAt
   }
);

// Add index for better query performance
reportSchema.index({ reporterUid: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);