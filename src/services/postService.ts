// src/services/postService.ts
import { calculateDistanceKm } from "@/src/lib/distance";
import { supabase } from "@/src/lib/supabase";
import type {
  AudioPost,
  Category,
  Reactions,
} from "@/src/store/useRecordingStore";

type FeedLocation = {
  latitude: number;
  longitude: number;
};

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

const APPROXIMATE_DISTANCE_TIE_KM = 0.05;

function normalizeCategory(category?: string | null): Category {
  return category === "around_you" ? "around_you" : "moments";
}

function normalizeReactions(reactions?: Partial<Reactions> | null): Reactions {
  return {
    "😂": reactions?.["😂"] ?? 0,
    "🚨": reactions?.["🚨"] ?? 0,
    "👍": reactions?.["👍"] ?? 0,
  };
}

function hasPostCoordinates(
  post: AudioPost,
): post is AudioPost & { latitude: number; longitude: number } {
  return typeof post.latitude === "number" && typeof post.longitude === "number";
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.max(1, Math.round(distanceKm * 1000))} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

function sortPostsByDistance(posts: AudioPost[], userLocation?: FeedLocation) {
  if (!userLocation) return posts;

  return posts
    .map((post, originalNewestIndex) => {
      if (!hasPostCoordinates(post)) {
        return { post, originalNewestIndex, distanceKm: null };
      }

      const distanceKm = calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        post.latitude,
        post.longitude,
      );

      return {
        originalNewestIndex,
        distanceKm,
        post: {
          ...post,
          distance: formatDistance(distanceKm),
          distanceKm,
        },
      };
    })
    .sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) {
        return a.originalNewestIndex - b.originalNewestIndex;
      }

      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;

      const distanceDelta = a.distanceKm - b.distanceKm;
      if (Math.abs(distanceDelta) < APPROXIMATE_DISTANCE_TIE_KM) {
        return a.originalNewestIndex - b.originalNewestIndex;
      }

      return distanceDelta;
    })
    .map(({ post }) => post);
}

function mapDbPostToAudioPost(post: DbPost): AudioPost {
  return {
    id: post.id,
    uri: post.audio_url ?? "",
    duration: post.duration ?? 0,
    views: post.views ?? 0,
    reactions: normalizeReactions(post.reactions),
    username: post.username ?? "Anonymous",
    avatar: post.avatar ?? "",
    neighborhood: post.neighborhood ?? "",
    town: post.town ?? "",
    country: post.country ?? "",
    category: normalizeCategory(post.category),
    latitude: post.latitude ?? null,
    longitude: post.longitude ?? null,
    distance: undefined,
    distanceKm: undefined,
    transcript: post.transcript ?? "",
    timestamp: post.created_at ?? "",
  };
}

export async function getPosts(options?: {
  userLocation?: FeedLocation | null;
  throwOnError?: boolean;
}): Promise<AudioPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .not("audio_url", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("getPosts error:", JSON.stringify(error, null, 2));
    if (options?.throwOnError) {
      throw error;
    }

    return [];
  }

  const posts = ((data ?? []) as DbPost[]).map(mapDbPostToAudioPost);

  return sortPostsByDistance(posts, options?.userLocation ?? undefined);
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

export async function incrementPostViews(postId: string): Promise<boolean> {
  const { error } = await supabase.rpc("increment_post_views", {
    post_id: postId,
  });

  if (error) {
    console.log(
      "incrementPostViews failed:",
      JSON.stringify(
        {
          postId,
          code: error.code,
          message: error.message,
          details: error.details,
        },
        null,
        2,
      ),
    );
    return false;
  }

  return true;
}

export async function incrementReaction(
  postId: string,
  emoji: keyof Reactions,
): Promise<boolean> {
  const { error } = await supabase.rpc("increment_post_reaction", {
    post_id: postId,
    reaction_key: emoji,
  });

  if (error) {
    console.log(
      "incrementReaction failed:",
      JSON.stringify(
        {
          postId,
          emoji,
          code: error.code,
          message: error.message,
          details: error.details,
        },
        null,
        2,
      ),
    );
    return false;
  }

  return true;
}

export async function deletePost(postId: string): Promise<void> {
  // Cloudinary asset cleanup needs a secure backend job; never ship secrets here.
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    throw error;
  }
}
