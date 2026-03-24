import { API_CONFIG } from "../config/constants";
import * as SecureStore from "expo-secure-store";

const BASE_URL = API_CONFIG.baseURL;

export interface UploadResponse {
  message: string;
  avatarUrl: string;
  user: any;
}

export const uploadApi = {
  /**
   * Upload user avatar
   * @param imageUri Local URI of the image to upload
   */
  async uploadAvatar(imageUri: string): Promise<UploadResponse> {
    try {
      const token = await SecureStore.getItemAsync("auth_token");

      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "avatar.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      // @ts-ignore - React Native FormData expects name, type, uri
      formData.append("file", {
        uri: imageUri,
        name: filename,
        type,
      });

      const response = await fetch(`${BASE_URL}/upload/avatar`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload avatar");
      }

      return await response.json();
    } catch (error) {
      console.error("[uploadApi] Upload error:", error);
      throw error;
    }
  },
};
