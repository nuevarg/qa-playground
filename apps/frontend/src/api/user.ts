import { api } from "./client";

export type CurrentUser = {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token: string;
};

export type CurrentUserApiResponse = {
  success: boolean;
  message: string;
  data: CurrentUser;
};

export type UpdateUserPayload = {
  username?: string;
  email?: string;
  password?: string;
  image?: string;
  bio?: string;
};

export const updateUser = async (
  payload: UpdateUserPayload
): Promise<CurrentUserApiResponse> => {
  const response = await api.put<CurrentUserApiResponse>("/user", {
    user: payload,
  });
  return response.data;
};

export const uploadAvatar = async (
  file: File
): Promise<{ success: boolean; message: string; data: { url: string; name: string } }> => {
  const arrayBuffer = await file.arrayBuffer();
  const response = await api.post<{ success: boolean; message: string; data: { url: string; name: string } }>(
    "/user/upload-avatar",
    arrayBuffer,
    {
      headers: {
        "Content-Type": file.type,
        "X-File-Name": file.name,
      },
    }
  );
  return response.data;
};
