import express from "express";
import { listAdmins, createAdmin, updateAdmin, deleteAdmin } from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLES.SUPER_ADMIN));

router.route("/").get(listAdmins).post(createAdmin);
router.route("/:id").put(updateAdmin).delete(deleteAdmin);

export default router;
