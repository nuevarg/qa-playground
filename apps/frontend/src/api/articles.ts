import { api } from "./client";

export type Profile = {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
};

export type ArticlesResponse = {
  articles: Article[];
  articlesCount: number;
};

export type TagsResponse = {
  tags: string[];
};

export type ArticlesQuery = {
  limit?: number;
  offset?: number;
  tag?: string;
  author?: string;
  favorited?: string;
};

export const getArticles = async (
  query: ArticlesQuery,
  signal?: AbortSignal,
): Promise<ArticlesResponse> => {
  const response = await api.get<ArticlesResponse>("/articles", {
    params: query,
    signal,
  });

  return response.data;
};

export const getTags = async (
  signal?: AbortSignal,
): Promise<TagsResponse> => {
  const response = await api.get<TagsResponse>("/tags", { signal });

  return response.data;
};
