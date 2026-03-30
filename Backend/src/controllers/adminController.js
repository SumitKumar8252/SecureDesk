import mongoose from "mongoose";
import User from "../models/User.js";
import Task from "../models/Task.js";
import ROLES from "../constants/roles.js";
import { sanitizeUser, buildPagination } from "../utils/responseHelpers.js";

const listAdmins = async (req, res) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
    const queryText = (req.query.q || "").trim();
    const skip = (page - 1) * limit;

    const searchFilter = queryText
      ? {
          $or: [
            { name: { $regex: queryText, $options: "i" } },
            { email: { $regex: queryText, $options: "i" } },
            { phone: { $regex: queryText, $options: "i" } },
          ],
        }
      : {};

    const filter = {
      role: ROLES.ADMIN,
      ...searchFilter,
    };

    const [admins, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return res.json({
      admins: admins.map(sanitizeUser),
      pagination: buildPagination(page, limit, total),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone, and password are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    const admin = await User.create({
      name,
      email,
      phone,
      password,
      role: ROLES.ADMIN,
    });

    return res.status(201).json({
      message: "Admin created successfully.",
      admin: sanitizeUser(admin),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid admin id." });
    }

    const admin = await User.findOne({ _id: id, role: ROLES.ADMIN }).select("+password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    if (email && email.toLowerCase() !== admin.email) {
      const duplicate = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });

      if (duplicate) {
        return res.status(409).json({ message: "Another user already uses this email." });
      }
    }

    admin.name = name || admin.name;
    admin.email = email ? email.toLowerCase() : admin.email;
    admin.phone = phone || admin.phone;

    if (password) {
      admin.password = password;
    }

    await admin.save();

    return res.json({
      message: "Admin updated successfully.",
      admin: sanitizeUser(admin),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid admin id." });
    }

    const admin = await User.findOne({ _id: id, role: ROLES.ADMIN });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const managedUsers = await User.find({ createdByAdmin: admin._id, role: ROLES.USER }).select("_id");
    const managedUserIds = managedUsers.map((user) => user._id);

    if (managedUserIds.length) {
      await Task.deleteMany({ owner: { $in: managedUserIds } });
      await User.deleteMany({ _id: { $in: managedUserIds } });
    }

    await admin.deleteOne();

    return res.json({
      message: "Admin and their managed users were deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { listAdmins, createAdmin, updateAdmin, deleteAdmin };
