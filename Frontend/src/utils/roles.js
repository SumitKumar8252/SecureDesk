export const ROLES = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  USER: "user",
};

export const getDashboardPath = (role) => {
  if (role === ROLES.SUPER_ADMIN) {
    return "/super-admin";
  }

  if (role === ROLES.ADMIN) {
    return "/admin";
  }

  return "/user";
};

export const getRoleLabel = (role) => {
  if (role === ROLES.SUPER_ADMIN) {
    return "Super Admin";
  }

  if (role === ROLES.ADMIN) {
    return "Admin";
  }

  return "User";
};
