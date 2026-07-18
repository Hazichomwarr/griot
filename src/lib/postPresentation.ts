import type { Strings } from "@/src/lib/i18n/strings";
import type { AudioPost } from "@/src/store/useRecordingStore";

export const MIN_VOICE_TITLE_LENGTH = 3;
export const MAX_VOICE_TITLE_LENGTH = 70;

export function getPostTitle(post: AudioPost, t: Strings) {
  const title = post.title?.trim();
  if (title) return title;

  const neighborhood = post.neighborhood?.trim();
  if (neighborhood) {
    return t.audioCard.voiceFallbackTitleWithLocation(neighborhood);
  }

  return t.audioCard.voiceFallbackTitle;
}

export function getVoiceTitleError(title: string, t: Strings) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) return t.record.voiceTitleRequired;
  if (trimmedTitle.length < MIN_VOICE_TITLE_LENGTH) {
    return t.record.voiceTitleTooShort;
  }

  return "";
}
