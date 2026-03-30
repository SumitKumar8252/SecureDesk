import express from "express";
import { listTasks, createTask, updateTask, deleteTask } from "../controllers/taskController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLES.USER));

router.route("/").get(listTasks).post(createTask);
router.route("/:id").put(updateTask).delete(deleteTask);

export default router;
