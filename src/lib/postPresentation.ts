import type { Strings } from "@/src/lib/i18n/strings";
import type { AudioPost, Category } from "@/src/store/useRecordingStore";

export const MIN_VOICE_TITLE_LENGTH = 3;
export const MAX_VOICE_TITLE_LENGTH = 70;
// Mirrored by the posts_contes_max_duration check in supabase/posts_contes_category.sql.
export const MAX_CONTE_DURATION_SECONDS = 300;

export function getMaxDurationMillis(category: Category) {
  return category === "contes" ? MAX_CONTE_DURATION_SECONDS * 1000 : null;
}

export function exceedsCategoryDuration(
  category: Category,
  durationMillis: number,
) {
  const maxMillis = getMaxDurationMillis(category);
  return maxMillis !== null && durationMillis > maxMillis;
}

// Titles are optional: a voice without one has no title, never a fallback.
export function getPostTitle(post: AudioPost) {
  return post.title?.trim() || null;
}

export function getVoiceTitleError(title: string, t: Strings) {
  const trimmedTitle = title.trim();

  if (trimmedTitle && trimmedTitle.length < MIN_VOICE_TITLE_LENGTH) {
    return t.record.voiceTitleTooShort;
  }

  return "";
}
