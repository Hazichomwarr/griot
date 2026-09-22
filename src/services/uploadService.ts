import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

export default async function uploadAudio(uri: string) {
  try {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Missing Cloudinary env variables");
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

    // Web: browser FormData with a real Blob.
    if (Platform.OS === "web") {
      const formData = new FormData();

      const response = await fetch(uri);
      const blob = await response.blob();

      formData.append("file", blob, "griot-recording.m4a");
      formData.append("upload_preset", uploadPreset);

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const data = await uploadResponse.json();

      if (!uploadResponse.ok || data.error) {
        console.log("Cloudinary upload failed");
        return null;
      }

      return data.secure_url as string;
    }

    // Native: let Expo's native file uploader construct the multipart request.
    const result = await FileSystem.uploadAsync(uploadUrl, uri, {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "file",
      mimeType: "audio/mp4",
      parameters: {
        upload_preset: uploadPreset,
      },
    });

    const data = JSON.parse(result.body);

    if (result.status < 200 || result.status >= 300 || data.error) {
      console.log("Cloudinary upload failed");
      return null;
    }

    return data.secure_url as string;
  } catch (err) {
    console.log("uploadAudio error:", err);
    return null;
  }
}
