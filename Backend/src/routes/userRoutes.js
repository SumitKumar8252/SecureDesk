import express from "express";
import { listUsers, createUser, updateUser, deleteUser } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN));

router.route("/").get(listUsers).post(createUser);
router.route("/:id").put(updateUser).delete(deleteUser);

export default router;
