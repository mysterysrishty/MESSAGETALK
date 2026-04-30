
/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  if (!email) return false;

  const value = String(email).trim();

  // Improved regex (covers most real-world emails)
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  return emailRegex.test(value);
};


/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: "Password is required" };
  }

  const value = String(password);

  if (value.length < 6) {
    return { isValid: false, message: "At least 6 characters required" };
  }

  if (!/[A-Z]/.test(value)) {
    return { isValid: false, message: "Add at least one uppercase letter" };
  }

  if (!/[0-9]/.test(value)) {
    return { isValid: false, message: "Add at least one number" };
  }

  return { isValid: true, message: "" };
};


/**
 * Validate name
 */
export const validateName = (name) => {
  if (!name) {
    return { isValid: false, message: "Name is required" };
  }

  const value = name.trim();

  if (value.length < 2) {
    return { isValid: false, message: "Minimum 2 characters required" };
  }

  if (!/^[a-zA-Z\s]+$/.test(value)) {
    return { isValid: false, message: "Only letters allowed" };
  }

  return { isValid: true, message: "" };
};

