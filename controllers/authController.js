const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
   const { email, password } = req.body;

   try {
      // Cek user ada atau tidak
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: "Email tidak ditemukan" });

      // Cek password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: "Password salah" });

      // Buat token
      const token = jwt.sign({
         id: user._id,
         name: user.name,
         email: user.email,
         role: user.role,
      },
         process.env.JWT_SECRET,
      { expiresIn: "1d" });

      res.json({
         message: "Login berhasil",
         token,
         user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
         },
      });
   } catch (err) {
      res.status(500).json({ error: "Terjadi kesalahan server", detail: err.message });
   }
};