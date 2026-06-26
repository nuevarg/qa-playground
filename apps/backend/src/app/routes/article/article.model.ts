import { Comment } from './comment.model';

export interface Article {
  id: number;
  title: string;
  slug: string;
  description: string;
  comments: Comment[];
  favorited: boolean;
  draft?: boolean;
  edited?: boolean;
  originalArticleId?: number | null;
}
