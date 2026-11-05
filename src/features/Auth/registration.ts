import { getPasswordError } from "@/lib/passwordPolicy";
import { sendPostRequest } from "@/services/api";
import type { UserInfo } from "@/contexts/AuthContext";

export const REGISTRATION_STEPS = ["Your profile", "Account details", "Secure account", "Verify email"];
export const passwordRequirements = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "Number", test: (v: string) => /[0-9]/.test(v) },
  { label: "Special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function registrationFieldError(name: string, value: string, password = "") {
  const text = value.trim();
  if (["firstName", "lastName", "username", "email"].includes(name) && !text) return "This field is required";
  if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return "Enter a valid email address";
  if (name === "username" && !/^[a-zA-Z0-9_.]{3,}$/.test(text)) return "Use at least 3 letters, numbers, underscores or dots";
  if (name === "phoneNumber" && text && !/^\+?[\d\s()-]{7,20}$/.test(text)) return "Enter a valid phone number";
  if (name === "dateOfBirth" && text && (!Number.isFinite(Date.parse(text)) || text > new Date().toISOString().slice(0, 10))) return "Enter a valid birth date in the past";
  if (name === "password") return getPasswordError(value);
  if (name === "confirmPassword" && (!value || value !== password)) return "Passwords do not match";
  return "";
}

export function readProfilePhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return Promise.reject(new Error("Choose a JPEG, PNG or WebP image"));
  if (file.size > 5 * 1024 * 1024) return Promise.reject(new Error("Choose an image smaller than 5 MB"));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image"));
    reader.readAsDataURL(file);
  });
}

// Authentication must be established before this protected upload. A photo
// failure never rolls back an otherwise successful registration.
export async function finishRegistration(info: UserInfo, photo: string | null, setUserInfo: (user: UserInfo) => void, onPhotoError: () => void) {
  setUserInfo(info);
  if (!photo) return;
  try {
    const response = await sendPostRequest("auth", "upload-profile-photo", { profilePhoto: photo });
    if (response.returnCode !== 200 || !response.returnData?.profilePhotoUrl) throw new Error("Photo upload failed");
    setUserInfo({ ...info, profilePhotoUrl: response.returnData.profilePhotoUrl });
  } catch { onPhotoError(); }
}
