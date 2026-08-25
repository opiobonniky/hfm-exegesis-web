// ─── HimFirstMedia Types ───────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface MinistryGoal {
  title: string;
  description: string;
  icon?: string;
}

export interface VisionStatement {
  title: string;
  content: string;
  scripture?: string;
}
