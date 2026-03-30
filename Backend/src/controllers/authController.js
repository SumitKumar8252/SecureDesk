import User from "../models/User.js";
import {
  couponMatchesRole,
  resolveSignupRole,
  roleRequiresCoupon,
} from "../seeds/registrationCoupons.js";
import generateToken from "../utils/generateToken.js";
import { sanitizeUser } from "../utils/responseHelpers.js";

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role: requestedRole, secretCoupon } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase();
    const role = resolveSignupRole(requestedRole);

    if (!role) {
      return res.status(400).json({ message: "The selected role is not valid." });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    if (roleRequiresCoupon(role) && !secretCoupon?.trim()) {
      return res.status(400).json({ message: "A valid secret coupon is required for this role." });
    }

    if (!couponMatchesRole(role, secretCoupon)) {
      return res.status(403).json({ message: "The secret coupon does not match the selected role." });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password,
      role,
      createdByAdmin: null,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      token: generateToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json({
      message: "Login successful.",
      token: generateToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  return res.json({
    user: sanitizeUser(req.user),
  });
};

export { register, login, getProfile };
