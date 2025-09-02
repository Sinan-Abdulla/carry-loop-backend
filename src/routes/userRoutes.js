const express = require('express');
const authRouter = express.Router();

const { validateSignUpData } = require("../utiles/validation");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// 🔹 SIGN UP
authRouter.post("/signUp", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use." });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      role,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    // Set secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Return user + token
    res.json({
      message: "User created successfully",
      user: savedUser,
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🔹 LOGIN
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    const token = await user.getJWT();

    // Set secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Return user + token
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = authRouter;
