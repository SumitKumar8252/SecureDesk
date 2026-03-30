import mongoose from "mongoose";
import User from "../models/User.js";
import Task from "../models/Task.js";
import ROLES from "../constants/roles.js";
import { sanitizeUser, buildPagination } from "../utils/responseHelpers.js";

const resolveAdminOwner = async (requestingUser, requestedAdminId) => {
  if (requestingUser.role === ROLES.ADMIN) {
    return requestingUser._id;
  }

  if (!requestedAdminId || !mongoose.Types.ObjectId.isValid(requestedAdminId)) {
    return null;
  }

  const admin = await User.findOne({ _id: requestedAdminId, role: ROLES.ADMIN });
  return admin ? admin._id : null;
};

const listUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
    const queryText = (req.query.q || "").trim();
    const adminId = req.query.adminId;
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
      role: ROLES.USER,
      ...searchFilter,
    };

    if (req.user.role === ROLES.ADMIN) {
      filter.createdByAdmin = req.user._id;
    } else if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
      filter.createdByAdmin = adminId;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate("createdByAdmin", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const mappedUsers = users.map((user) => ({
      ...sanitizeUser(user),
      createdByAdmin: user.createdByAdmin
        ? {
            id: user.createdByAdmin._id,
            name: user.createdByAdmin.name,
            email: user.createdByAdmin.email,
          }
        : null,
    }));

    return res.json({
      users: mappedUsers,
      pagination: buildPagination(page, limit, total),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, adminId } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone, and password are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    const adminOwner = await resolveAdminOwner(req.user, adminId);

    if (!adminOwner) {
      return res.status(400).json({ message: "A valid admin owner is required for this user." });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: ROLES.USER,
      createdByAdmin: adminOwner,
    });

    await user.populate("createdByAdmin", "name email");

    return res.status(201).json({
      message: "User created successfully.",
      user: {
        ...sanitizeUser(user),
        createdByAdmin: user.createdByAdmin
          ? {
              id: user.createdByAdmin._id,
              name: user.createdByAdmin.name,
              email: user.createdByAdmin.email,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, adminId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const filter = {
      _id: id,
      role: ROLES.USER,
    };

    if (req.user.role === ROLES.ADMIN) {
      filter.createdByAdmin = req.user._id;
    }

    const user = await User.findOne(filter).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found or not accessible." });
    }

    if (email && email.toLowerCase() !== user.email) {
      const duplicate = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });

      if (duplicate) {
        return res.status(409).json({ message: "Another user already uses this email." });
      }
    }

    user.name = name || user.name;
    user.email = email ? email.toLowerCase() : user.email;
    user.phone = phone || user.phone;

    if (password) {
      user.password = password;
    }

    if (req.user.role === ROLES.SUPER_ADMIN && adminId) {
      const adminOwner = await resolveAdminOwner(req.user, adminId);

      if (!adminOwner) {
        return res.status(400).json({ message: "A valid admin owner is required." });
      }

      user.createdByAdmin = adminOwner;
    }

    await user.save();
    await user.populate("createdByAdmin", "name email");

    return res.json({
      message: "User updated successfully.",
      user: {
        ...sanitizeUser(user),
        createdByAdmin: user.createdByAdmin
          ? {
              id: user.createdByAdmin._id,
              name: user.createdByAdmin.name,
              email: user.createdByAdmin.email,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const filter = {
      _id: id,
      role: ROLES.USER,
    };

    if (req.user.role === ROLES.ADMIN) {
      filter.createdByAdmin = req.user._id;
    }

    const user = await User.findOne(filter);

    if (!user) {
      return res.status(404).json({ message: "User not found or not accessible." });
    }

    await Task.deleteMany({ owner: user._id });
    await user.deleteOne();

    return res.json({
      message: "User and their tasks were deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { listUsers, createUser, updateUser, deleteUser };
