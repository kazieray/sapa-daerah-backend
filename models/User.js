const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
   name: { type: String, required: true, unique: true },
   email: { type: String, required: true, unique: true },
   password: String,
   role: { type: String, enum: ["masyarakat", "admin", "petugas"], default: "masyarakat" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);