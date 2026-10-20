import api from "../services/api";

export interface UploadResponse {
  message: string;
  avatarUrl: string;
  user: any;
}

export const uploadApi = {
  /**
   * Upload user avatar (POST /upload/avatar, multipart/form-data).
   * Goes through the shared ApiClient: it attaches the stored auth token,
   * applies the timeout and clears the session on 401. The client detects
   * FormData and lets the runtime set the multipart boundary.
   */
  async uploadAvatar(imageUri: string): Promise<UploadResponse> {
    const filename = imageUri.split("/").pop() || "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    const formData = new FormData();
    // @ts-ignore - React Native FormData expects name, type, uri
    formData.append("file", {
      uri: imageUri,
      name: filename,
      type,
    });

    const response = await api.post<UploadResponse>("/upload/avatar", formData);
    return response.data!;
  },
};
