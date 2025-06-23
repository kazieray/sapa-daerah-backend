const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Tambah User (oleh admin)
exports.createUser = async (req, res) => {
   try {
      const { name, email, password, role } = req.body;
      const hashed = await bcrypt.hash(password, 10);

      const newUser = new User({ name, email, password: hashed, role });
      const saved = await newUser.save();
      res.status(201).json(saved);
   } catch (err) {
      res.status(500).json({ error: "Gagal menambahkan user", details: err.message });
   }
};

// ✅ Ambil semua user
exports.getUsers = async (req, res) => {
   try {
      const users = await User.find();
      res.json(users);
   } catch (err) {
      res.status(500).json({ error: "Gagal ambil data user" });
   }
};

// ✅ Update user
exports.updateUser = async (req, res) => {
   try {
      const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
   } catch (err) {
      res.status(500).json({ error: "Gagal update user" });
   }
};

// ✅ Hapus user
exports.deleteUser = async (req, res) => {
   try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User berhasil dihapus" });
   } catch (err) {
      res.status(500).json({ error: "Gagal hapus user" });
   }
};