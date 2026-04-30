import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.js";
import { generateToken } from "../Utils/helpers.js";

/* ===========================
   REGISTER USER
=========================== */
export const register = async (req, res) => {
  try {
    let { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ detail: "All fields are required" });
    }

    // Normalize input
    email = email.trim().toLowerCase();
    name = name.trim();

    if (password.length < 6) {
      return res
        .status(400)
        .json({ detail: "Password must be at least 6 characters" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ detail: "Email already exists" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate user id
    const user_id = `user_${uuidv4().replace(/-/g, "").slice(0, 12)}`;

    // Create user
    const user = new User({
      user_id,
      email,
      password_hash,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user_id}`,
    });

    await user.save();

    // Generate token
    const token = generateToken(user_id, email);

    return res.status(201).json({
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ detail: "Registration failed" });
  }
};

/* ===========================
   LOGIN USER
=========================== */
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ detail: "Email and password are required" });
    }

    // Normalize input
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user || !user.password_hash) {
      return res.status(401).json({ detail: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ detail: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user.user_id, user.email);

    return res.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ detail: "Login failed" });
  }
};

/* ===========================
   GET CURRENT USER
=========================== */
export const getCurrentUser = (req, res) => {
  res.json(req.user);
};

/* ===========================
   LOGOUT
=========================== */
export const logout = (req, res) => {
  res.json({ message: "Logged out successfully" });
};

/* ===========================
   SEED USERS (DEV ONLY)
=========================== */
export const seedAdmin = async () => {
  try {
    const adminEmail =
      process.env.ADMIN_EMAIL?.toLowerCase() || "admin@msgmate.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const password_hash = await bcrypt.hash(adminPassword, 10);
      const user_id = `user_${uuidv4().replace(/-/g, "").slice(0, 12)}`;

      admin = new User({
        user_id,
        email: adminEmail,
        password_hash,
        name: "Admin",
        role: "admin",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user_id}`,
      });

      await admin.save();
      console.log("✅ Admin created");
    }

    // Test user
    const testEmail = "test@msgmate.com";

    let testUser = await User.findOne({ email: testEmail });

    if (!testUser) {
      const password_hash = await bcrypt.hash("test123", 10);
      const user_id = `user_${uuidv4().replace(/-/g, "").slice(0, 12)}`;

      testUser = new User({
        user_id,
        email: testEmail,
        password_hash,
        name: "Test User",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user_id}`,
      });

      await testUser.save();
      console.log("✅ Test user created");
    }
  } catch (error) {
    console.error("Seed error:", error.message);
  }
};