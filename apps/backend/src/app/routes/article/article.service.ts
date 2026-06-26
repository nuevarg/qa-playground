import slugify from 'slugify';
import prisma from '../../../prisma/prisma-client';
import HttpException from '../../models/http-exception.model';
import profileMapper from '../profile/profile.utils';
import articleMapper from './article.mapper';
import { Tag } from '../tag/tag.model';

const buildFindAllQuery = (query: any, id: number | undefined) => {
  const queries: any = [];

  if ('author' in query) {
    queries.push({
      author: {
        username: {
          equals: query.author,
        },
      },
    });
  }

  if ('tag' in query) {
    queries.push({
      tagList: {
        some: {
          name: query.tag,
        },
      },
    });
  }

  if ('favorited' in query) {
    queries.push({
      favoritedBy: {
        some: {
          username: {
            equals: query.favorited,
          },
        },
      },
    });
  }
  if (query.draft === 'true' || query.draft === true) {
    queries.push({
      draft: true,
      authorId: id || -1,
    });
  } else {
    queries.push({
      draft: false,
    });
  }

  return queries;
};

export const getArticles = async (query: any, id?: number) => {
  const andQueries = buildFindAllQuery(query, id);
  const articlesCount = await prisma.article.count({
    where: {
      AND: andQueries,
    },
  });

  const articles = await prisma.article.findMany({
    where: { AND: andQueries },
    orderBy: {
      createdAt: 'desc',
    },
    skip: Number(query.offset) || 0,
    take: Number(query.limit) || 10,
    include: {
      tagList: {
        select: {
          name: true,
        },
      },
      author: {
        select: {
          username: true,
          bio: true,
          image: true,
          followedBy: true,
        },
      },
      favoritedBy: true,
      _count: {
        select: {
          favoritedBy: true,
        },
      },
    },
  });

  return {
    articles: articles.map((article: any) => articleMapper(article, id)),
    articlesCount,
  };
};

export const getFeed = async (offset: number, limit: number, id: number) => {
  const allArticles = await prisma.article.findMany({
    where: {
      draft: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      tagList: {
        select: {
          name: true,
        },
      },
      author: {
        select: {
          username: true,
          bio: true,
          image: true,
          followedBy: true,
        },
      },
      favoritedBy: true,
      _count: {
        select: {
          favoritedBy: true,
        },
      },
    },
  });

  const isFollowed = (article: any) => {
    return article.author.followedBy.some((f: any) => f.id === id);
  };

  const followedArticles = allArticles.filter(isFollowed);
  const otherArticles = allArticles.filter((art) => !isFollowed(art));
  
  const sortedArticles = [...followedArticles, ...otherArticles];
  const articlesCount = sortedArticles.length;
  
  const off = offset || 0;
  const lim = limit || 10;
  const paginatedArticles = sortedArticles.slice(off, off + lim);

  return {
    articles: paginatedArticles.map((article: any) => articleMapper(article, id)),
    articlesCount,
  };
};

export const createArticle = async (article: any, id: number) => {
  const { title, description, body, tagList, draft } = article;
  const tags = Array.isArray(tagList) ? tagList : [];

  if (!title) {
    throw new HttpException(422, { errors: { title: ["can't be blank"] } });
  }

  if (!body) {
    throw new HttpException(422, { errors: { body: ["can't be blank"] } });
  }

  if (tags.length === 0) {
    throw new HttpException(422, { errors: { tags: ["at least one tag is required"] } });
  }

  const desc = description || body.substring(0, 150);

  const slug = draft
    ? `draft-${slugify(title)}-${id}`
    : `${slugify(title)}-${id}`;

  const existingTitle = await prisma.article.findUnique({
    where: {
      slug,
    },
    select: {
      slug: true,
    },
  });

  if (existingTitle) {
    throw new HttpException(422, { errors: { title: ['must be unique'] } });
  }

  const {
    authorId,
    id: articleId,
    ...createdArticle
  } = await prisma.article.create({
    data: {
      title,
      description: desc,
      body,
      slug,
      draft: !!draft,
      tagList: {
        connectOrCreate: tags.map((tag: string) => ({
          create: { name: tag },
          where: { name: tag },
        })),
      },
      author: {
        connect: {
          id: id,
        },
      },
    },
    include: {
      tagList: {
        select: {
          name: true,
        },
      },
      author: {
        select: {
          username: true,
          bio: true,
          image: true,
          followedBy: true,
        },
      },
      favoritedBy: true,
      _count: {
        select: {
          favoritedBy: true,
        },
      },
    },
  });

  return articleMapper(createdArticle, id);
};

export const getArticle = async (slug: string, id?: number) => {
  const article = await prisma.article.findUnique({
    where: {
      slug,
    },
    include: {
      tagList: {
        select: {
          name: true,
        },
      },
      author: {
        select: {
          username: true,
          bio: true,
          image: true,
          followedBy: true,
        },
      },
      favoritedBy: true,
      _count: {
        select: {
          favoritedBy: true,
        },
      },
    },
  });

  if (!article) {
    throw new HttpException(404, { errors: { article: ['not found'] } });
  }

  if (article.draft && article.authorId !== id) {
    throw new HttpException(404, { errors: { article: ['not found'] } });
  }

  return articleMapper(article, id);
};

const disconnectArticlesTags = async (slug: string) => {
  await prisma.article.update({
    where: {
      slug,
    },
    data: {
      tagList: {
        set: [],
      },
    },
  });
};

export const updateArticle = async (article: any, slug: string, id: number) => {
  if (article.tagList && (!Array.isArray(article.tagList) || article.tagList.length === 0)) {
    throw new HttpException(422, { errors: { tags: ["at least one tag is required"] } });
  }

  const existingArticle = await prisma.article.findFirst({
    where: {
      slug,
    },
    select: {
      id: true,
      authorId: true,
      draft: true,
      originalArticleId: true,
      title: true,
      description: true,
      body: true,
      slug: true,
      tagList: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!existingArticle) {
    throw new HttpException(404, {});
  }

  if (existingArticle.authorId !== id) {
    throw new HttpException(403, {
      message: 'You are not authorized to update this article',
    });
  }

  const tags = Array.isArray(article.tagList)
    ? article.tagList
    : existingArticle.tagList.map((t: any) => t.name);

  const desc = article.description || (article.body ? article.body.substring(0, 150) : existingArticle.description);

  // 1. If existing article is a PUBLISHED article:
  if (!existingArticle.draft) {
    // 1a. If saving as a draft:
    if (article.draft) {
      // Find if draft copy already exists:
      let draftCopy = await prisma.article.findFirst({
        where: {
          draft: true,
          originalArticleId: existingArticle.id,
        },
      });

      const titleVal = article.title || existingArticle.title;
      const draftSlug = `draft-${slugify(titleVal)}-${id}`;

      if (draftCopy) {
        // Disconnect old tags on draft copy first:
        await disconnectArticlesTags(draftCopy.slug);
        
        // Update existing draft copy:
        const updatedDraft = await prisma.article.update({
          where: { id: draftCopy.id },
          data: {
            title: titleVal,
            description: desc,
            body: article.body || existingArticle.body,
            slug: draftSlug,
            tagList: {
              connectOrCreate: tags.map((tag: string) => ({
                create: { name: tag },
                where: { name: tag },
              })),
            },
            updatedAt: new Date(),
          },
          include: {
            tagList: { select: { name: true } },
            author: { select: { username: true, bio: true, image: true, followedBy: true } },
            favoritedBy: true,
            _count: { select: { favoritedBy: true } },
          },
        });
        return articleMapper(updatedDraft, id);
      } else {
        // Create new draft copy:
        const newDraft = await prisma.article.create({
          data: {
            title: titleVal,
            description: desc,
            body: article.body || existingArticle.body,
            slug: draftSlug,
            draft: true,
            originalArticle: {
              connect: {
                id: existingArticle.id,
              },
            },
            tagList: {
              connectOrCreate: tags.map((tag: string) => ({
                create: { name: tag },
                where: { name: tag },
              })),
            },
            author: { connect: { id } },
          },
          include: {
            tagList: { select: { name: true } },
            author: { select: { username: true, bio: true, image: true, followedBy: true } },
            favoritedBy: true,
            _count: { select: { favoritedBy: true } },
          },
        });
        return articleMapper(newDraft, id);
      }
    } else {
      // 1b. If publishing directly (standard update):
      // Update original article directly, set edited: true
      const newSlug = article.title ? `${slugify(article.title)}-${id}` : existingArticle.slug;
      
      // If title changed, make sure new slug is unique:
      if (article.title && newSlug !== existingArticle.slug) {
        const existingSlug = await prisma.article.findUnique({ where: { slug: newSlug } });
        if (existingSlug) {
          throw new HttpException(422, { errors: { title: ['must be unique'] } });
        }
      }

      await disconnectArticlesTags(existingArticle.slug);
      
      // Delete any outstanding draft copies:
      await prisma.article.deleteMany({
        where: {
          draft: true,
          originalArticleId: existingArticle.id,
        },
      });

      const updatedOriginal = await prisma.article.update({
        where: { id: existingArticle.id },
        data: {
          title: article.title || existingArticle.title,
          description: desc,
          body: article.body || existingArticle.body,
          slug: newSlug,
          edited: true,
          tagList: {
            connectOrCreate: tags.map((tag: string) => ({
              create: { name: tag },
              where: { name: tag },
            })),
          },
          updatedAt: new Date(),
        },
        include: {
          tagList: { select: { name: true } },
          author: { select: { username: true, bio: true, image: true, followedBy: true } },
          favoritedBy: true,
          _count: { select: { favoritedBy: true } },
        },
      });
      return articleMapper(updatedOriginal, id);
    }
  }

  // 2. If existing article is a DRAFT article:
  else {
    // 2a. If saving as a draft:
    if (article.draft) {
      // Update the draft record directly
      const draftSlug = article.title ? `draft-${slugify(article.title)}-${id}` : existingArticle.slug;
      
      await disconnectArticlesTags(existingArticle.slug);

      const updatedDraft = await prisma.article.update({
        where: { id: existingArticle.id },
        data: {
          title: article.title || existingArticle.title,
          description: desc,
          body: article.body || existingArticle.body,
          slug: draftSlug,
          tagList: {
            connectOrCreate: tags.map((tag: string) => ({
              create: { name: tag },
              where: { name: tag },
            })),
          },
          updatedAt: new Date(),
        },
        include: {
          tagList: { select: { name: true } },
          author: { select: { username: true, bio: true, image: true, followedBy: true } },
          favoritedBy: true,
          _count: { select: { favoritedBy: true } },
        },
      });
      return articleMapper(updatedDraft, id);
    } else {
      // 2b. If publishing:
      if (existingArticle.originalArticleId) {
        // This draft is an edit of a published article
        const originalId = existingArticle.originalArticleId;
        const originalArticle = await prisma.article.findUnique({
          where: { id: originalId },
        });

        if (!originalArticle) {
          // If original article was deleted somehow, treat draft as a new article:
          const newSlug = article.title ? `${slugify(article.title)}-${id}` : `published-${existingArticle.id}`;
          await disconnectArticlesTags(existingArticle.slug);
          const publishedDraft = await prisma.article.update({
            where: { id: existingArticle.id },
            data: {
              title: article.title || existingArticle.title,
              description: desc,
              body: article.body || existingArticle.body,
              slug: newSlug,
              draft: false,
              originalArticle: {
                disconnect: true,
              },
              tagList: {
                connectOrCreate: tags.map((tag: string) => ({
                  create: { name: tag },
                  where: { name: tag },
                })),
              },
              updatedAt: new Date(),
            },
            include: {
              tagList: { select: { name: true } },
              author: { select: { username: true, bio: true, image: true, followedBy: true } },
              favoritedBy: true,
              _count: { select: { favoritedBy: true } },
            },
          });
          return articleMapper(publishedDraft, id);
        }

        // Apply edits to original article, set edited: true
        const newSlug = article.title ? `${slugify(article.title)}-${id}` : originalArticle.slug;

        // Disconnect original tags first:
        await disconnectArticlesTags(originalArticle.slug);

        const updatedOriginal = await prisma.article.update({
          where: { id: originalId },
          data: {
            title: article.title || existingArticle.title,
            description: desc,
            body: article.body || existingArticle.body,
            slug: newSlug,
            edited: true,
            tagList: {
              connectOrCreate: tags.map((tag: string) => ({
                create: { name: tag },
                where: { name: tag },
              })),
            },
            updatedAt: new Date(),
          },
          include: {
            tagList: { select: { name: true } },
            author: { select: { username: true, bio: true, image: true, followedBy: true } },
            favoritedBy: true,
            _count: { select: { favoritedBy: true } },
          },
        });

        // Delete draft copy:
        await prisma.article.delete({
          where: { id: existingArticle.id },
        });

        return articleMapper(updatedOriginal, id);
      } else {
        // This is a new draft created from scratch
        const newSlug = article.title ? `${slugify(article.title)}-${id}` : `${slugify(existingArticle.title)}-${id}`;

        // Ensure new slug is unique:
        const existingSlug = await prisma.article.findUnique({ where: { slug: newSlug } });
        if (existingSlug && existingSlug.id !== existingArticle.id) {
          throw new HttpException(422, { errors: { title: ['must be unique'] } });
        }

        await disconnectArticlesTags(existingArticle.slug);

        const publishedDraft = await prisma.article.update({
          where: { id: existingArticle.id },
          data: {
            title: article.title || existingArticle.title,
            description: desc,
            body: article.body || existingArticle.body,
            slug: newSlug,
            draft: false,
            tagList: {
              connectOrCreate: tags.map((tag: string) => ({
                create: { name: tag },
                where: { name: tag },
              })),
            },
            updatedAt: new Date(),
          },
          include: {
            tagList: { select: { name: true } },
            author: { select: { username: true, bio: true, image: true, followedBy: true } },
            favoritedBy: true,
            _count: { select: { favoritedBy: true } },
          },
        });
        return articleMapper(publishedDraft, id);
      }
    }
  }
};

export const deleteArticle = async (slug: string, id: number) => {
  const existingArticle = await prisma.article.findFirst({
    where: {
      slug,
    },
    select: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!existingArticle) {
    throw new HttpException(404, {});
  }

  if (existingArticle.author.id !== id) {
    throw new HttpException(403, {
      message: 'You are not authorized to delete this article',
    });
  }
  await prisma.article.delete({
    where: {
      slug,
    },
  });
};

export const getCommentsByArticle = async (slug: string, id?: number) => {
  const queries = [];

  queries.push({
    author: {
      demo: true,
    },
  });

  if (id) {
    queries.push({
      author: {
        id,
      },
    });
  }

  const comments = await prisma.article.findUnique({
    where: {
      slug,
    },
    include: {
      comments: {
        where: {
          OR: queries,
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          body: true,
          author: {
            select: {
              username: true,
              bio: true,
              image: true,
              followedBy: true,
            },
          },
        },
      },
    },
  });

  const result = comments?.comments.map((comment: any) => ({
    ...comment,
    author: {
      username: comment.author.username,
      bio: comment.author.bio,
      image: comment.author.image,
      following: comment.author.followedBy.some(
        (follow: any) => follow.id === id
      ),
    },
  }));

  return result;
};

export const addComment = async (body: string, slug: string, id: number) => {
  if (!body) {
    throw new HttpException(422, { errors: { body: ["can't be blank"] } });
  }

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!article) {
    throw new HttpException(404, { errors: { article: ['not found'] } });
  }

  const comment = await prisma.comment.create({
    data: {
      body,
      article: {
        connect: {
          id: article.id,
        },
      },
      author: {
        connect: {
          id: id,
        },
      },
    },
    include: {
      author: {
        select: {
          username: true,
          bio: true,
          image: true,
          followedBy: true,
        },
      },
    },
  });

  return {
    id: comment.id,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    body: comment.body,
    author: {
      username: comment.author.username,
      bio: comment.author.bio,
      image: comment.author.image,
      following: comment.author.followedBy.some(
        (follow: any) => follow.id === id
      ),
    },
  };
};

export const deleteComment = async (id: number, userId: number) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id,
      author: {
        id: userId,
      },
    },
    select: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!comment) {
    throw new HttpException(404, {});
  }

  if (comment.author.id !== userId) {
    throw new HttpException(403, {
      message: 'You are not authorized to delete this comment',
    });
  }

  await prisma.comment.delete({
    where: {
      id,
    },
  });
};

export const favoriteArticle = async (slugPayload: string, id: number) => {
  const { _count, ...article } = await prisma.article.update({
    where: {
      slug: slugPayload,
    },
    data: {
      favoritedBy: {
        connect: {
          id: id,
        },
      },
    },
    include: {
      tagList: {
        select: {
          name: true,
        },
      },
      author: {
        select: {
          username: true,
          bio: true,
          image: true,
          followedBy: true,
        },
      },
      favoritedBy: true,
      _count: {
        select: {
          favoritedBy: true,
        },
      },
    },
  });

  const result = {
    ...article,
    author: profileMapper(article.author, id),
    tagList: article?.tagList.map((tag: Tag) => tag.name),
    favorited: article.favoritedBy.some(
      (favorited: any) => favorited.id === id
    ),
    favoritesCount: _count?.favoritedBy,
  };

  return result;
};

export const unfavoriteArticle = async (slugPayload: string, id: number) => {
  const { _count, ...article } = await prisma.article.update({
    where: {
      slug: slugPayload,
    },
    data: {
      favoritedBy: {
        disconnect: {
          id: id,
        },
      },
    },
    include: {
      tagList: {
        select: {
          name: true,
        },
      },
      author: {
        select: {
          username: true,
          bio: true,
          image: true,
          followedBy: true,
        },
      },
      favoritedBy: true,
      _count: {
        select: {
          favoritedBy: true,
        },
      },
    },
  });

  const result = {
    ...article,
    author: profileMapper(article.author, id),
    tagList: article?.tagList.map((tag: Tag) => tag.name),
    favorited: article.favoritedBy.some(
      (favorited: any) => favorited.id === id
    ),
    favoritesCount: _count?.favoritedBy,
  };

  return result;
};
