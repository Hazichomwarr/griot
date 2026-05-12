// src/lib/services/postService.ts
import { supabase } from "../lib/supabase";

// export async function createPost(post: any) {
//   const { data, error } = await supabase
//     .from("posts")
//     .insert(post)
//     .select()
//     .single();

//   if (error) {
//     console.log("createPost error:", error);
//   }
//   return data;
// }

export async function createPost(post: any) {
  // 👇 Add this temporarily
  console.log("Supabase URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
  console.log("Inserting post:", JSON.stringify(post, null, 2));

  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select()
    .single();

  if (error) {
    console.log("createPost error:", JSON.stringify(error, null, 2));
  }
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
