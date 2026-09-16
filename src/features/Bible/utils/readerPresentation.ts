import {
  CheckCircle2,
  Ear,
  Eye,
  GraduationCap,
  Heart,
} from "lucide-react";

export function parseJsonList<T = string>(
  raw: string | undefined | null,
): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getReaderLabel(
  labels: Record<string, string>,
  key: string,
  fallback: string,
): string {
  return labels[key] || fallback;
}

export function getLabStageIcon(iconName: string) {
  const icons = { Eye, Ear, GraduationCap, Heart, CheckCircle2 };
  return icons[iconName as keyof typeof icons];
}
