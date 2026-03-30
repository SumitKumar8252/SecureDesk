import User from "../models/User.js";
import ROLES from "../constants/roles.js";

const ensureSuperAdmin = async () => {
  const name = process.env.SUPER_ADMIN_NAME;
  const email = process.env.SUPER_ADMIN_EMAIL;
  const phone = process.env.SUPER_ADMIN_PHONE;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!name || !email || !phone || !password) {
    console.warn("Skipping super admin seed because one or more SUPER_ADMIN_* env values are missing.");
    return;
  }

  const existingSuperAdmin = await User.findOne({ email: email.toLowerCase() });

  if (existingSuperAdmin) {
    return;
  }

  await User.create({
    name,
    email,
    phone,
    password,
    role: ROLES.SUPER_ADMIN,
  });

  console.log(`Seeded default super admin: ${email}`);
};

export default ensureSuperAdmin;
