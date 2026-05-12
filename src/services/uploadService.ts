// src/services/uploadService.ts

import "react-native-url-polyfill/auto";

// export async function uploadAudio(uri: string) {
//   try {
//     // read local file as base64
//     const base64 = await FileSystem.readAsStringAsync(uri, {
//       encoding: "base64",
//     });

//     // unique filename
//     const fileName = `recordings/${Date.now()}.m4a`;

//     // upload
//     console.log("Uploading file:", fileName);
//     const { error } = await supabase.storage
//       .from("audio")
//       .upload(fileName, decode(base64), { contentType: "audio/m4a" });

//     if (error) {
//       console.log("upload error:", error);
//       return null;
//     }

//     // Public URL
//     const { data } = supabase.storage.from("audio").getPublicUrl(fileName);

//     return data.publicUrl;
//   } catch (err) {
//     console.log("uploadAudio error:", err);
//     return null;
//   }
// }

// export async function uploadAudio(uri: string) {
//   console.log("Recording URI:", uri);
//   try {
//     // 1. convert local file → blob
//     const response = await fetch(uri);
//     const blob = await response.blob();

//     // 2. unique filename
//     const fileName = `${Date.now()}.m4a`;

//     console.log("Uploading file:", fileName);

//     // 3. upload blob
//     const { error } = await supabase.storage
//       .from("audio")
//       .upload(fileName, blob, {
//         contentType: "audio/m4a",
//       });

//     if (error) {
//       console.log("upload error:", error);
//       return null;
//     }

//     // 4. public URL
//     const { data } = supabase.storage.from("audio").getPublicUrl(fileName);

//     return data.publicUrl;
//   } catch (err) {
//     console.log("uploadAudio error:", err);
//     return null;
//   }
// }

// export async function uploadAudio(uri: string) {
//   try {
//     console.log("Recording URI:", uri);

//     // read local file
//     const base64 = await FileSystem.readAsStringAsync(uri, {
//       encoding: "base64",
//     });

//     // filename
//     const filePath = `${Date.now()}.m4a`;

//     console.log("Uploading file:", filePath);

//     // upload
//     const { data, error } = await supabase.storage
//       .from("audio")
//       .upload(filePath, decode(base64), {
//         contentType: "audio/m4a",
//         upsert: false,
//       });

//     if (error) {
//       console.log("upload error:", error);
//       return null;
//     }

//     console.log("UPLOAD DATA:", data);

//     // public URL
//     const { data: publicUrlData } = supabase.storage
//       .from("audio")
//       .getPublicUrl(filePath);

//     return publicUrlData.publicUrl;
//   } catch (err) {
//     console.log("uploadAudio error:", err);
//     return null;
//   }
// }

export default async function uploadAudio(uri: string) {
  try {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Missing Cloudinary env variables");
    }
    console.log("Uploading audio:", uri);

    //form data for Cloudinary
    const formData = new FormData();

    formData.append("file", {
      uri,
      type: "audio/m4a",
      name: "griot-recording.m4a",
    } as any);

    formData.append("upload_preset", uploadPreset);

    // upload request
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      { method: "POST", body: formData },
    );
    const data = await response.json();
    console.log("Cloudinary response:", data);

    // Successful upload URL
    return data.secure_url;
  } catch (err) {
    console.log("uploadAudio error:", err);
    return null;
  }
}
