import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

// Temporary in-memory OTP storage: { email: { otpHash, name, passwordHash, expires } }
const otpStore = {};

// =================== REGISTER & SEND OTP ===================
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingOtp = otpStore[email];
    if (existingOtp && Date.now() < existingOtp.expires - 4 * 60 * 1000) {
      return res.status(429).json({
        message: "OTP already sent, please wait a minute before retrying",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const passwordHash = await bcrypt.hash(password, 10);

    otpStore[email] = {
      otpHash,
      name,
      passwordHash,
      expires: Date.now() + 5 * 60 * 1000, // 5 min expiry
    };

    await sendEmail(email, "Your FitTrack OTP", `Your OTP is: ${otp}`);

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Register OTP Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =================== VERIFY OTP & CREATE USER ===================
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const stored = otpStore[email];
    if (!stored) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (Date.now() > stored.expires) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, stored.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const newUser = await User.create({
      name: stored.name,
      email,
      password: stored.passwordHash,
    });

    delete otpStore[email];

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({ token });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =================== LOGIN USER ===================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
