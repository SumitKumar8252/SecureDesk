const sanitizeUser = (userDocument) => ({
  id: userDocument._id,
  name: userDocument.name,
  email: userDocument.email,
  phone: userDocument.phone,
  role: userDocument.role,
  createdByAdmin: userDocument.createdByAdmin,
  createdAt: userDocument.createdAt,
  updatedAt: userDocument.updatedAt,
});

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
});

export { sanitizeUser, buildPagination };
