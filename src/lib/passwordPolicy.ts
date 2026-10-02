// Keep this in sync with backend/src/utils/passwordPolicy.js so inline
// validation matches what the API enforces (no late, surprising errors).
export const PASSWORD_REQUIREMENTS_MESSAGE =
  "Password must be at least 8 characters with uppercase, lowercase, number, and special character";

export const getPasswordError = (password: string): string => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Minimum 8 characters";
  if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return "Must include uppercase, lowercase, number, and special character";
  }
  return "";
};