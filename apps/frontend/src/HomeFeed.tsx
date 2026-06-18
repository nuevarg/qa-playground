import { useEffect, useMemo, useState } from "react";

import {
  getArticles,
  getTags,
  type Article,
  type ArticlesResponse,
  type TagsResponse,
} from "./api/articles";
import { getApiErrorMessages } from "./api/errors";
import { TEST_ID } from "./constant/testIds.ts";

const PAGE_SIZE = 10;

type FeedState = {
  articles: Article[];
  articlesCount: number;
  tags: string[];
};

const initialFeedState: FeedState = {
  articles: [],
  articlesCount: 0,
  tags: [],
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

function HomeFeed() {
  const [feedState, setFeedState] = useState<FeedState>(initialFeedState);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(feedState.articlesCount / PAGE_SIZE)),
    [feedState.articlesCount],
  );

  useEffect(() => {
    const controller = new AbortController();
    const loadFeed = async () => {
      setErrorMessages([]);

      try {
        const offset = (page - 1) * PAGE_SIZE;
        const [articlesResult, tagsResult]: [ArticlesResponse, TagsResponse] =
          await Promise.all([
            getArticles(
              {
                limit: PAGE_SIZE,
                offset,
                ...(selectedTag ? { tag: selectedTag } : {}),
              },
              controller.signal,
            ),
            getTags(controller.signal),
          ]);

        setFeedState({
          articles: articlesResult.articles,
          articlesCount: articlesResult.articlesCount,
          tags: tagsResult.tags,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessages(
          getApiErrorMessages(
            error,
            "Failed to load articles from the backend.",
          ),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadFeed();

    return () => controller.abort();
  }, [page, selectedTag]);

  const handleTagSelect = (tag: string | null) => {
    if (selectedTag !== tag || page !== 1) {
      setIsLoading(true);
    }

    setSelectedTag(tag);
    setPage(1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setIsLoading(true);
    }

    setPage((currentPage) => Math.max(1, currentPage - 1));
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setIsLoading(true);
    }

    setPage((currentPage) => Math.min(totalPages, currentPage + 1));
  };

  return (
    <div className="feed-page" data-testid={TEST_ID.FEED.PAGE}>
      <header className="feed-header">
        <div>
          <h1>Global Feed</h1>
          <p>
            Browse seeded backend articles, filter by tag, and use pagination
            to move through the article list.
          </p>
        </div>
        {selectedTag && (
          <button
            className="secondary-button compact-button"
            data-testid={TEST_ID.FEED.CLEAR_TAG_BUTTON}
            type="button"
            onClick={() => handleTagSelect(null)}
          >
            Clear tag
          </button>
        )}
      </header>

      <div className="feed-layout">
        <section className="feed-main" aria-live="polite">
          <div className="feed-toolbar">
            <div>
              <span className="feed-kicker">Articles</span>
              <h2>{selectedTag ? `Tagged: ${selectedTag}` : "All Articles"}</h2>
            </div>
            <span className="article-count" data-testid={TEST_ID.FEED.COUNT}>
              {feedState.articlesCount} total
            </span>
          </div>

          {isLoading && (
            <div className="empty-state" data-testid={TEST_ID.FEED.LOADING}>
              Loading articles...
            </div>
          )}

          {!isLoading && errorMessages.length > 0 && (
            <div className="form-error" data-testid={TEST_ID.FEED.ERROR}>
              <ul className="error-list">
                {errorMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {!isLoading &&
            errorMessages.length === 0 &&
            feedState.articles.length === 0 && (
              <div className="empty-state" data-testid={TEST_ID.FEED.EMPTY}>
                No articles found for this filter.
              </div>
            )}

          {!isLoading && errorMessages.length === 0 && (
            <div className="article-list" data-testid={TEST_ID.FEED.LIST}>
              {feedState.articles.map((article) => (
                <article
                  className="article-card"
                  data-testid={TEST_ID.FEED.ARTICLE_CARD}
                  key={article.slug}
                >
                  <div className="article-meta">
                    <div className="author-avatar">
                      {article.author.image ? (
                        <img
                          alt=""
                          src={article.author.image}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        article.author.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <strong>{article.author.username}</strong>
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                    <span className="favorite-pill">
                      {article.favoritesCount} favorites
                    </span>
                  </div>

                  <h3>{article.title}</h3>
                  <p>{article.description}</p>

                  <div className="article-footer">
                    <span className="read-more-label">Read more</span>
                    <div className="tag-list">
                      {article.tagList.map((tag) => (
                        <button
                          className="tag-chip"
                          key={`${article.slug}-${tag}`}
                          type="button"
                          onClick={() => handleTagSelect(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!isLoading && errorMessages.length === 0 && (
            <nav
              className="pagination"
              data-testid={TEST_ID.FEED.PAGINATION}
              aria-label="Article pagination"
            >
              <button
                className="secondary-button compact-button"
                disabled={page === 1}
                type="button"
                onClick={handlePreviousPage}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                className="secondary-button compact-button"
                disabled={page === totalPages}
                type="button"
                onClick={handleNextPage}
              >
                Next
              </button>
            </nav>
          )}
        </section>

        <aside className="tag-sidebar">
          <h2>Popular Tags</h2>
          <div className="sidebar-tags" data-testid={TEST_ID.FEED.TAGS}>
            <button
              className={!selectedTag ? "tag-filter active" : "tag-filter"}
              type="button"
              onClick={() => handleTagSelect(null)}
            >
              All
            </button>
            {feedState.tags.map((tag) => (
              <button
                className={
                  selectedTag === tag ? "tag-filter active" : "tag-filter"
                }
                key={tag}
                type="button"
                onClick={() => handleTagSelect(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default HomeFeed;
