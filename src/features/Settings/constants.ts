import { tt } from '@/components/languages/hardcodedTranslate';
// ─── Settings Constants ───────────────────────────────────────────────────────

export const INITIAL_PROFILE = {
  id: "", username: "", email: "", firstName: "", lastName: "",
  middleName: "", phoneNumber: "", dateOfBirth: "", gender: "",
  profilePhotoUrl: "", maritalStatus: "", alternativePhone: "",
  ministryGroup: "", servicePosition: "", spiritualGifts: "",
  emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelationship: "",
};
export const NOTIFICATION_KEYS = [
  "dailyVerseReminder", "devotionReminder", "emailNotifications",
  "pushNotifications", "studyReminders",
];
export const ADDITIONAL_FIELDS = [
  "maritalStatus", "alternativePhone", "ministryGroup",
  "servicePosition", "spiritualGifts",
] as const;
export const TAB_CONFIG = [
  { value: "profile", icon: "User", label: tt("Profile"), short: "Profile" },
  { value: "additional", icon: "Star", label: tt("Details"), short: "Details" },
  { value: "password", icon: "Lock", label: tt("Password"), short: "Pass" },
  { value: "preferences", icon: "Sliders", label: tt("Reading"), short: "Read" },
  { value: "notifications", icon: "Bell", label: tt("Notifications"), short: "Notify" },
]
