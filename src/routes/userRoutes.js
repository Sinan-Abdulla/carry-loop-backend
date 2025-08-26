const express = require('express');
const authRouter = express.Router();

const { validateSignUpData } = require("../utiles/validation");
const User = require("../models/User");
const bcrypt = require("bcrypt");

authRouter.post("/signUp", async (req, res) => {
    try {
        const { firstName, lastName, email, password,role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("Email is already in use.");
        }

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

        res.cookie("token", token, {
            expires: new Date(Date.now() + 900000),
        });
        res.json({ message: "User created successfully", data: savedUser });
    } catch (error) {
        res.status(400).send("error:" + error.message);
    }
});

authRouter.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid credentials");
  
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) throw new Error("Invalid credentials");
  
      const token = await user.getJWT();
  
      // ✅ Set secure, HttpOnly cookie
      res.cookie("token", token, {
        httpOnly: true,         // JavaScript can't access this cookie
        secure: process.env.NODE_ENV === "production", // only HTTPS in prod
        sameSite: "strict",     // prevent CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
  
      res.json({ user,token }); // No need to send token in body if it's in cookie
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
module.exports = authRouter;
