// src/services/postService.ts
import { supabase } from "@/src/lib/supabase";
import type {
  AudioPost,
  Category,
  Reactions,
} from "@/src/store/useRecordingStore";

type DbPost = {
  id: string;
  audio_url: string | null;
  duration?: number | null;
  views?: number | null;
  reactions?: Reactions | null;
  username?: string | null;
  avatar?: string | null;
  neighborhood?: string | null;
  town?: string | null;
  country?: string | null;
  category?: string | null;
  transcript?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string | null;
};

function normalizeCategory(category?: string | null): Category {
  return category === "around_you" ? "around_you" : "moments";
}

function mapDbPostToAudioPost(post: DbPost): AudioPost {
  return {
    id: post.id,
    uri: post.audio_url ?? "",
    duration: post.duration ?? 0,
    views: post.views ?? 0,
    reactions: post.reactions ?? {
      "😂": 0,
      "🚨": 0,
      "👍": 0,
    },
    username: post.username ?? "Anonymous",
    avatar: post.avatar ?? "",
    neighborhood: post.neighborhood ?? "",
    town: post.town ?? "",
    country: post.country ?? "",
    category: normalizeCategory(post.category),
    transcript: post.transcript ?? "",
    timestamp: post.created_at ?? "",
  };
}

export async function getPosts(): Promise<AudioPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .not("audio_url", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("getPosts error:", JSON.stringify(error, null, 2));
    return [];
  }

  return ((data ?? []) as DbPost[]).map(mapDbPostToAudioPost);
}

export async function createPost(post: {
  audio_url: string;
  duration?: number;
  views?: number;
  reactions?: Record<string, number>;
  username: string;
  avatar?: string;
  neighborhood?: string;
  town?: string;
  country?: string;
  category: Category;
  transcript?: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const dbPost = {
    audio_url: post.audio_url,
    duration: post.duration ?? 0,
    views: post.views ?? 0,
    reactions: post.reactions ?? { "😂": 0, "🚨": 0, "👍": 0 },
    username: post.username,
    avatar: post.avatar ?? "",
    neighborhood: post.neighborhood ?? "",
    town: post.town ?? "",
    country: post.country ?? "",
    category: post.category,
    transcript: post.transcript ?? "",
    latitude: post.latitude ?? null,
    longitude: post.longitude ?? null,
  };

  console.log("createPost insert payload:", JSON.stringify(dbPost, null, 2));

  const { data, error } = await supabase
    .from("posts")
    .insert(dbPost)
    .select()
    .single();

  if (error) {
    console.log("createPost insert failed:", JSON.stringify(error, null, 2));
    return null;
  }

  console.log("createPost insert succeeded:", JSON.stringify(data, null, 2));
  return mapDbPostToAudioPost(data);
}
