import type { Category } from "@/src/store/useRecordingStore";

type CategoryTheme = {
  primary: string;
  light: string;
  accent: string;
  deep: string;
  bg: string;
};

const categoryThemes: Record<Category, CategoryTheme> = {
  moments: {
    primary: "#FFB300",
    light: "#FFD54F",
    accent: "#FF9100",
    deep: "#E65100",
    bg: "#1A1200",
  },
  around_you: {
    primary: "#2979FF",
    light: "#64B5F6",
    accent: "#00ACC1",
    deep: "#1565C0",
    bg: "#0A0F1A",
  },
};

export function getCategoryTheme(category?: string | null) {
  return category === "around_you"
    ? categoryThemes.around_you
    : categoryThemes.moments;
}
