import mongoose from "mongoose";
import Task from "../models/Task.js";
import { buildPagination } from "../utils/responseHelpers.js";

const listTasks = async (req, res) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
    const queryText = (req.query.q || "").trim();
    const status = (req.query.status || "").trim();
    const skip = (page - 1) * limit;

    const filter = {
      owner: req.user._id,
    };

    if (queryText) {
      filter.$or = [
        { title: { $regex: queryText, $options: "i" } },
        { description: { $regex: queryText, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ]);

    return res.json({
      tasks,
      pagination: buildPagination(page, limit, total),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required." });
    }

    const task = await Task.create({
      title,
      description,
      status,
      owner: req.user._id,
    });

    return res.status(201).json({
      message: "Task created successfully.",
      task,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const task = await Task.findOne({ _id: id, owner: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    task.title = title || task.title;
    task.description = typeof description === "string" ? description : task.description;
    task.status = status || task.status;

    await task.save();

    return res.json({
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const task = await Task.findOne({ _id: id, owner: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    await task.deleteOne();

    return res.json({
      message: "Task deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { listTasks, createTask, updateTask, deleteTask };
