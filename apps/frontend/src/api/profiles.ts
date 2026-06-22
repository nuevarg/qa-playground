import { api } from "./client";
import type { Profile } from "./articles";


export type ProfileResponse = {
  profile: Profile;
};

export const getProfile = async (
  username: string,
  signal?: AbortSignal,
): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>(`/profiles/${username}`, {
    signal,
  });
  return response.data;
};

export const followUser = async (username: string): Promise<ProfileResponse> => {
  const response = await api.post<ProfileResponse>(`/profiles/${username}/follow`);
  return response.data;
};

export const unfollowUser = async (username: string): Promise<ProfileResponse> => {
  const response = await api.delete<ProfileResponse>(`/profiles/${username}/follow`);
  return response.data;
};
