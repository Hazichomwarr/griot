// src/store/useRecordingStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/src/lib/storageKeys";
import { create } from "zustand";

console.log("STORE INIT");

export type Category = "moments" | "around_you";

export type Reactions = {
  "😂": number;
  "🚨": number;
  "👍": number;
};

export type AudioPost = {
  id: string;
  uri: string;
  duration?: number; // audio duration
  title?: string | null;

  views: number;
  reactions: Reactions;

  username: string;
  avatar: string;
  neighborhood: string;
  town: string;
  country?: string;
  category: Category;
  latitude?: number | null;
  longitude?: number | null;

  distance?: string; // computed when feed posts are loaded
  distanceKm?: number;
  timestamp?: string; // Tonight
  transcript?: string;
};

type Store = {
  activeId: string | null;

  posts: AudioPost[];
  setPosts: (posts: AudioPost[]) => void;

  saved: string[];
  savedHydrated: boolean;
  savedHydrating: boolean;
  hydrateSaved: () => Promise<void>;
  toggleSave: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;

  viewedPostIds: string[];
  hasViewedPost: (id: string) => boolean;

  reactedPostIds: string[];
  hasReactedToPost: (id: string) => boolean;

  reportedPostIds: string[];
  hasReportedPost: (id: string) => boolean;
  markPostReported: (id: string) => void;

  myPostIds: string[];
  addMyPostId: (id: string) => void;
  removePost: (postId: string) => Promise<void>;

  stopAllAudioFlag: number;
  triggerStopAllAudio: () => void;

  setActive: (id: string) => void;
  //addRecording: (uri: string, category: Category) => AudioPost;
  deleteRecording: (id: string) => void;

  incrementViews: (id: string) => void;
  addReaction: (id: string, emoji: keyof Reactions) => void;
};

export const useRecordingStore = create<Store>((set, get) => ({
  posts: [],
  activeId: null,
  stopAllAudioFlag: 0,

  saved: [],
  savedHydrated: false,
  savedHydrating: false,
  viewedPostIds: [],
  reactedPostIds: [],
  reportedPostIds: [],
  myPostIds: [],

  triggerStopAllAudio: () =>
    set((state) => ({ stopAllAudioFlag: state.stopAllAudioFlag + 1 })),

  setActive: (id) =>
    set((state) => (state.activeId === id ? state : { activeId: id })),

  setPosts: (posts) => set({ posts }),
  deleteRecording: (id) =>
    set((state) => ({
      posts: state.posts.filter((r) => r.id !== id),
    })),

  incrementViews: (id) =>
    set((state) => {
      if (state.viewedPostIds.includes(id)) {
        return state;
      }

      return {
        viewedPostIds: [...state.viewedPostIds, id],
        posts: state.posts.map((r) =>
          r.id === id ? { ...r, views: r.views + 1 } : r,
        ),
      };
    }),

  hasViewedPost: (id) => {
    return get().viewedPostIds.includes(id);
  },

  addReaction: (id, emoji) =>
    set((state) => {
      if (state.reactedPostIds.includes(id)) {
        return state;
      }

      return {
        reactedPostIds: [...state.reactedPostIds, id],
        posts: state.posts.map((r) =>
          r.id === id
            ? {
                ...r,
                reactions: {
                  ...r.reactions,
                  [emoji]: (r.reactions[emoji] ?? 0) + 1,
                },
              }
            : r,
        ),
      };
    }),

  hasReactedToPost: (id) => {
    return get().reactedPostIds.includes(id);
  },

  hasReportedPost: (id) => {
    return get().reportedPostIds.includes(id);
  },

  markPostReported: (id) =>
    set((state) => {
      if (state.reportedPostIds.includes(id)) {
        return state;
      }

      return {
        reportedPostIds: [...state.reportedPostIds, id],
      };
    }),

  hydrateSaved: async () => {
    if (get().savedHydrated || get().savedHydrating) return;

    set({ savedHydrating: true });

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.savedPostIds);

      if (!raw) {
        set({
          saved: [],
          savedHydrated: true,
          savedHydrating: false,
        });
        return;
      }

      const parsed: unknown = JSON.parse(raw);
      const ids = Array.isArray(parsed)
        ? [
            ...new Set(
              parsed.filter(
                (value): value is string => typeof value === "string",
              ),
            ),
          ]
        : [];

      set({
        saved: ids,
        savedHydrated: true,
        savedHydrating: false,
      });
    } catch (error) {
      console.log("hydrateSaved error:", error);

      set({
        saved: [],
        savedHydrated: true,
        savedHydrating: false,
      });
    }
  },

  toggleSave: async (id) => {
    const current = get().saved;
    const nextSaved = current.includes(id)
      ? current.filter((savedId) => savedId !== id)
      : [...current, id];

    set({ saved: nextSaved });

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.savedPostIds,
        JSON.stringify(nextSaved),
      );
    } catch (error) {
      console.log("persist saved error:", error);
    }
  },

  isSaved: (id) => {
    return get().saved.includes(id);
  },

  addMyPostId: (id) =>
    set((state) => ({
      myPostIds: state.myPostIds.includes(id)
        ? state.myPostIds
        : [...state.myPostIds, id],
    })),

  removePost: async (postId) => {
    const nextSaved = get().saved.filter((id) => id !== postId);

    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
      myPostIds: state.myPostIds.filter((id) => id !== postId),
      saved: state.saved.filter((id) => id !== postId),
      viewedPostIds: state.viewedPostIds.filter((id) => id !== postId),
      reactedPostIds: state.reactedPostIds.filter((id) => id !== postId),
      reportedPostIds: state.reportedPostIds.filter((id) => id !== postId),
      activeId: state.activeId === postId ? null : state.activeId,
    }));

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.savedPostIds,
        JSON.stringify(nextSaved),
      );
    } catch (error) {
      console.log("persist saved after delete error:", error);
    }
  },
}));
