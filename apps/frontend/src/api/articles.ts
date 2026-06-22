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

export type FeedQuery = {
  limit?: number;
  offset?: number;
};

export const getFeedArticles = async (
  query: FeedQuery,
  signal?: AbortSignal,
): Promise<ArticlesResponse> => {
  const response = await api.get<ArticlesResponse>("/articles/feed", {
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

export type Comment = {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: Profile;
};

export type CommentResponse = {
  comment: Comment;
};

export type CommentsResponse = {
  comments: Comment[];
};

export type ArticleResponse = {
  article: Article;
};

export const getArticle = async (
  slug: string,
  signal?: AbortSignal,
): Promise<ArticleResponse> => {
  const response = await api.get<ArticleResponse>(`/articles/${slug}`, {
    signal,
  });
  return response.data;
};

export const createArticle = async (
  article: { title: string; description?: string; body: string; tagList?: string[] },
): Promise<ArticleResponse> => {
  const response = await api.post<ArticleResponse>("/articles", { article });
  return response.data;
};

export const updateArticle = async (
  slug: string,
  article: { title?: string; description?: string; body?: string; tagList?: string[] },
): Promise<ArticleResponse> => {
  const response = await api.put<ArticleResponse>(`/articles/${slug}`, { article });
  return response.data;
};

export const deleteArticle = async (slug: string): Promise<void> => {
  await api.delete(`/articles/${slug}`);
};

export const getComments = async (
  slug: string,
  signal?: AbortSignal,
): Promise<CommentsResponse> => {
  const response = await api.get<CommentsResponse>(`/articles/${slug}/comments`, {
    signal,
  });
  return response.data;
};

export const addComment = async (
  slug: string,
  body: string,
): Promise<CommentResponse> => {
  const response = await api.post<CommentResponse>(`/articles/${slug}/comments`, {
    comment: { body },
  });
  return response.data;
};

export const deleteComment = async (
  slug: string,
  id: number,
): Promise<void> => {
  await api.delete(`/articles/${slug}/comments/${id}`);
};

export const favoriteArticle = async (slug: string): Promise<ArticleResponse> => {
  const response = await api.post<ArticleResponse>(`/articles/${slug}/favorite`);
  return response.data;
};

export const unfavoriteArticle = async (slug: string): Promise<ArticleResponse> => {
  const response = await api.delete<ArticleResponse>(`/articles/${slug}/favorite`);
  return response.data;
};

