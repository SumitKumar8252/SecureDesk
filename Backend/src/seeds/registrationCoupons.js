import ROLES from "../constants/roles.js";

const registrationCoupons = {
  [ROLES.ADMIN]: process.env.ADMIN_SIGNUP_COUPON || "ADMIN-ACCESS-2026",
  [ROLES.SUPER_ADMIN]: process.env.SUPER_ADMIN_SIGNUP_COUPON || "SUPER-ACCESS-2026",
};

const privilegedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

const resolveSignupRole = (requestedRole) => {
  if (requestedRole === undefined || requestedRole === null || requestedRole === "") {
    return ROLES.USER;
  }

  const normalizedRole = String(requestedRole).trim();
  return Object.values(ROLES).includes(normalizedRole) ? normalizedRole : null;
};

const roleRequiresCoupon = (role) => privilegedRoles.includes(role);

const couponMatchesRole = (role, coupon) => {
  if (!roleRequiresCoupon(role)) {
    return true;
  }

  const expectedCoupon = registrationCoupons[role];
  return Boolean(expectedCoupon) && coupon?.trim() === expectedCoupon;
};

export { registrationCoupons, resolveSignupRole, roleRequiresCoupon, couponMatchesRole };
