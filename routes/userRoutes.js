const express = require("express");
const router = express.Router();
const { createUser, getUsers, updateUser, deleteUser } = require("../controllers/userController");
const { protect, protectAdmin } = require("../middleware/authJWT");

// Route CRUD User - semua memerlukan admin auth
router.post("/", protect, protectAdmin, createUser); // tambah user
router.get("/", protect, protectAdmin, getUsers); // ambil semua user
router.put("/:id", protect, protectAdmin, updateUser); // update user
router.delete("/:id", protect, protectAdmin, deleteUser); // hapus user

module.exports = router;