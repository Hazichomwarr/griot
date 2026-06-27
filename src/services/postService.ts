import { supabase } from "../lib/supabase";

type CreatePostInput = {
  audio_url: string;
  duration?: number;
  views?: number;
  reactions?: Record<string, number>;
  username: string;
  avatar?: string;
  neighborhood?: string;
  town?: string;
  country?: string;
  category: string;
  transcript?: string;
};

export async function createPost(post: CreatePostInput) {
  const dbPost = {
    audio_url: post.audio_url,
    duration: post.duration ?? 0,
    views: post.views ?? 0,
    reactions: post.reactions ?? {},
    username: post.username,
    avatar: post.avatar ?? "",
    neighborhood: post.neighborhood ?? "",
    town: post.town ?? "",
    country: post.country ?? "",
    category: post.category,
    transcript: post.transcript ?? "",
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
  return data;
}

export async function getPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("getPosts error:", error);
    return [];
  }

  return data;
}
