import { Platform } from "react-native";

export default async function uploadAudio(uri: string) {
  try {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Missing Cloudinary env variables");
    }

    console.log("Uploading audio:", uri);

    const formData = new FormData();

    if (Platform.OS === "web") {
      // Web needs a real Blob/File, not { uri, type, name }
      const response = await fetch(uri);
      const blob = await response.blob();

      formData.append("file", blob, "griot-recording.m4a");
    } else {
      // Native iOS/Android uses React Native file object shape
      formData.append("file", {
        uri,
        type: "audio/m4a",
        name: "griot-recording.m4a",
      } as any);
    }

    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    console.log("Cloudinary response:", data);

    if (!response.ok || data.error) {
      console.log("Cloudinary upload failed:", data.error ?? data);
      return null;
    }

    return data.secure_url as string;
  } catch (err) {
    console.log("uploadAudio error:", err);
    return null;
  }
}
