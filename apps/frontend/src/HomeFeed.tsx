import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArticleCreateModal } from "./components/ArticleCreateModal";

import {
  getArticles,
  getFeedArticles,
  getTags,
  favoriteArticle,
  unfavoriteArticle,
  createArticle,
  type Article,
  type ArticlesResponse,
  type TagsResponse,
} from "./api/articles";
import { getApiErrorMessages } from "./api/errors";
import { TEST_ID } from "./constant/testIds.ts";
import { TagInput } from "./components/TagInput";
import { ArticleEditorModal } from "./components/ArticleEditorModal";
import { FeedArticleCard } from "./components/FeedArticleCard";
import { Avatar } from "./components/Avatar";

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



type CurrentUser = {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token: string;
};

type HomeFeedProps = {
  currentUser: CurrentUser | null;
};

function HomeFeed({ currentUser }: HomeFeedProps) {
  const navigate = useNavigate();
  const [feedState, setFeedState] = useState<FeedState>(initialFeedState);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"global" | "feed">(() => {
    return localStorage.getItem("token") ? "feed" : "global";
  });
  const [page, setPage] = useState(1);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoritingMap, setIsFavoritingMap] = useState<Record<string, boolean>>({});
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSuccess = (newArticle: Article, asDraft: boolean) => {
    if (!asDraft) {
      setFeedState((prev) => ({
        ...prev,
        articles: [newArticle, ...prev.articles],
        articlesCount: prev.articlesCount + 1,
      }));
    }
    setIsCreateModalOpen(false);
  };

  const handleFavoriteToggle = async (slug: string, isFavorited: boolean) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setIsFavoritingMap((prev) => ({ ...prev, [slug]: true }));
    try {
      let updatedArticle;
      if (isFavorited) {
        const res = await unfavoriteArticle(slug);
        updatedArticle = res.article;
      } else {
        const res = await favoriteArticle(slug);
        updatedArticle = res.article;
      }

      setFeedState((prev) => ({
        ...prev,
        articles: prev.articles.map((art) =>
          art.slug === slug ? updatedArticle : art
        ),
      }));
    } catch (error) {
      console.error("Failed to toggle favorite status", error);
    } finally {
      setIsFavoritingMap((prev) => ({ ...prev, [slug]: false }));
    }
  };

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
        const fetchPromise = (activeTab === "feed" && !selectedTag)
          ? getFeedArticles({ limit: PAGE_SIZE, offset }, controller.signal)
          : getArticles(
              {
                limit: PAGE_SIZE,
                offset,
                ...(selectedTag ? { tag: selectedTag } : {}),
              },
              controller.signal
            );

        const [articlesResult, tagsResult]: [ArticlesResponse, TagsResponse] =
          await Promise.all([
            fetchPromise,
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
  }, [page, selectedTag, activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      {selectedTag && (
        <header className="feed-header" style={{ justifyContent: "flex-end", marginBottom: "16px" }}>
          <button
            className="secondary-button compact-button"
            data-testid={TEST_ID.FEED.CLEAR_TAG_BUTTON}
            type="button"
            onClick={() => handleTagSelect(null)}
          >
            Clear tag
          </button>
        </header>
      )}

      <div className="feed-layout">
        <section className="feed-main" aria-live="polite">
          <div className="feed-sticky-header">
            {currentUser && (
              <div className="feed-composer">
                <div 
                  className="composer-placeholder"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <div className="author-avatar small">
                    <Avatar src={currentUser.image} alt={currentUser.username} />
                  </div>
                  <span>Share something new on the feed...</span>
                </div>
              </div>
            )}

          <div className="feed-selection-container">
            <div className="custom-dropdown-container">
              <button
                className="custom-dropdown-trigger"
                data-testid="feed-dropdown-trigger"
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                onBlur={() => {
                  setTimeout(() => setIsDropdownOpen(false), 200);
                }}
              >
                {selectedTag ? `#${selectedTag}` : activeTab === "feed" ? "Your Feed" : "Global Feed"}
                <span className="dropdown-arrow">▼</span>
              </button>
              {isDropdownOpen && (
                <div className="custom-dropdown-menu">
                  {currentUser && (
                    <button
                      className={`custom-dropdown-item ${activeTab === "feed" && !selectedTag ? "active" : ""}`}
                      data-testid={TEST_ID.FEED.YOUR_FEED_TAB}
                      type="button"
                      onClick={() => {
                        setActiveTab("feed");
                        handleTagSelect(null);
                        setIsDropdownOpen(false);
                      }}
                    >
                      Your Feed
                    </button>
                  )}
                  <button
                    className={`custom-dropdown-item ${activeTab === "global" && !selectedTag ? "active" : ""}`}
                    data-testid={TEST_ID.FEED.GLOBAL_FEED_TAB}
                    type="button"
                    onClick={() => {
                      setActiveTab("global");
                      handleTagSelect(null);
                      setIsDropdownOpen(false);
                    }}
                  >
                    Global Feed
                  </button>
                  {selectedTag && (
                    <button
                      className="custom-dropdown-item active"
                      type="button"
                      disabled
                    >
                      #{selectedTag}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="feed-selection-line"></div>
          </div>
          </div>

          <div className="feed-toolbar" style={{ marginTop: "16px" }}>
            <div>
              <span className="feed-kicker">Articles</span>
              <h2>
                {selectedTag
                  ? `Tagged: ${selectedTag}`
                  : activeTab === "feed"
                  ? "Articles by followed authors"
                  : "All Articles"}
              </h2>
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
              {(currentUser ? feedState.articles : feedState.articles.slice(0, 3)).map((article) => (
                <FeedArticleCard
                  key={article.slug}
                  article={article}
                  currentUser={currentUser}
                  onEdit={(art) => setEditingArticle(art)}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavoriting={!!isFavoritingMap[article.slug]}
                  onDeleteSuccess={(slug) => {
                    setFeedState((prev) => ({
                      ...prev,
                      articles: prev.articles.filter((art) => art.slug !== slug),
                      articlesCount: prev.articlesCount - 1,
                    }));
                  }}
                />
              ))}
              {!currentUser && feedState.articlesCount > 3 && (
                <div className="login-prompt-card" data-testid="login-prompt-card">
                  <div className="login-prompt-card-content">
                    <div className="lock-icon">🔒</div>
                    <h3>Want to read more?</h3>
                    <p>Create an account or login to unlock unlimited access to all articles and features.</p>
                    <div className="login-prompt-actions">
                      <button className="primary-button compact-button" onClick={() => navigate("/login")}>
                        Login
                      </button>
                      <button className="secondary-button compact-button" onClick={() => navigate("/register")}>
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && errorMessages.length === 0 && currentUser && (
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

        <div className="sidebar-container">
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
          <div className={`scroll-to-top-container ${showScrollButton ? "visible" : ""}`}>
            <button
              className="scroll-to-top-btn"
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Scroll to top"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: "18px", height: "18px" }}
              >
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
      {editingArticle && (
        <ArticleEditorModal
          article={editingArticle}
          onClose={() => setEditingArticle(null)}
          onSuccess={(updatedArticle) => {
            setFeedState((prev) => ({
              ...prev,
              articles: prev.articles.map((art) =>
                art.slug === editingArticle.slug ? updatedArticle : art
              ),
            }));
            setEditingArticle(null);
          }}
        />
      )}
      {isCreateModalOpen && (
        <ArticleCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}

export default HomeFeed;
