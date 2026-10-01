/**
 * System Role Constants
 */
export const ROLES = {
  USER: "user",
  MAINTENANCE: "maintenance",
  ADMIN: "admin"
};

/**
 * Valid roles list for validation schemas and Mongoose enums.
 * Includes legacy "maintainance" spelling to ensure backward compatibility with existing database records.
 */
export const VALID_ROLES = [ROLES.USER, ROLES.MAINTENANCE, "maintainance", ROLES.ADMIN];

/**
 * Normalizes role strings to canonical spelling.
 * Converts legacy "maintainance" typo to canonical "maintenance".
 * 
 * @param {string} role 
 * @returns {string} Normalized role
 */
export const normalizeRole = (role) => {
  if (!role) return role;
  if (typeof role !== "string") return role;
  const lower = role.toLowerCase();
  if (lower === "maintainance") return ROLES.MAINTENANCE;
  return lower;
};
