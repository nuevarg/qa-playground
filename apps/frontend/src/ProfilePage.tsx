import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProfile, followUser, unfollowUser, getFollowers, getFollowing } from "./api/profiles";
import {
  getArticles,
  favoriteArticle,
  unfavoriteArticle,
  createArticle,
  type Article,
  type Profile,
} from "./api/articles";
import { getApiErrorMessages } from "./api/errors";
import { FeedArticleCard } from "./components/FeedArticleCard";
import { ArticleEditorModal } from "./components/ArticleEditorModal";
import { Avatar } from "./components/Avatar";
import { TagInput } from "./components/TagInput";
import { TEST_ID } from "./constant/testIds.ts";

const PAGE_SIZE = 5;

type CurrentUser = {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token: string;
};

type ProfilePageProps = {
  currentUser: CurrentUser | null;
  onUserUpdate: (updatedUser: CurrentUser) => void;
};

export function ProfilePage({ currentUser }: ProfilePageProps) {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"authored" | "favorited" | "drafts">("authored");
  const [page, setPage] = useState(1);
  const [reloadArticlesTrigger, setReloadArticlesTrigger] = useState(0);

  // Composer states
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [composerTitle, setComposerTitle] = useState("");
  const [composerBody, setComposerBody] = useState("");
  const [composerTags, setComposerTags] = useState<string[]>([]);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [composerErrorMessages, setComposerErrorMessages] = useState<string[]>([]);

  // Followers/Following list state
  const [profilesList, setProfilesList] = useState<Profile[]>([]);
  const [isLoadingProfilesList, setIsLoadingProfilesList] = useState(false);
  const [errorMessagesProfilesList, setErrorMessagesProfilesList] = useState<string[]>([]);
  const [togglingFollowMap, setTogglingFollowMap] = useState<Record<string, boolean>>({});
  const [activeModalTab, setActiveModalTab] = useState<"followers" | "following" | null>(null);

  // Loaders & Errors
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [errorMessagesProfile, setErrorMessagesProfile] = useState<string[]>([]);
  const [errorMessagesArticles, setErrorMessagesArticles] = useState<string[]>([]);

  // Editing and Favoriting triggers
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isFavoritingMap, setIsFavoritingMap] = useState<Record<string, boolean>>({});

  const isOwnProfile = currentUser && profile && currentUser.username === profile.username;

  useEffect(() => {
    setActiveTab("authored");
    setPage(1);
    setActiveModalTab(null);
  }, [username]);

  // 1. Fetch Profile info
  useEffect(() => {
    if (!username) return;

    const controller = new AbortController();
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      setErrorMessagesProfile([]);
      try {
        const res = await getProfile(username, controller.signal);
        setProfile(res.profile);
      } catch (err) {
        if (controller.signal.aborted) return;
        setErrorMessagesProfile(
          getApiErrorMessages(err, "Failed to load profile details.")
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, [username]);

  // 2. Fetch Articles matching active tab
  useEffect(() => {
    if (!username) return;
    if (activeTab !== "authored" && activeTab !== "favorited" && activeTab !== "drafts") return;

    const controller = new AbortController();
    const fetchArticles = async () => {
      setIsLoadingArticles(true);
      setErrorMessagesArticles([]);
      try {
        const offset = (page - 1) * PAGE_SIZE;
        const res = await getArticles(
          {
            limit: PAGE_SIZE,
            offset,
            ...(activeTab === "authored"
              ? { author: username }
              : activeTab === "favorited"
              ? { favorited: username }
              : { author: username, draft: true }),
          },
          controller.signal
        );
        setArticles(res.articles);
        setArticlesCount(res.articlesCount);
      } catch (err) {
        if (controller.signal.aborted) return;
        setErrorMessagesArticles(
          getApiErrorMessages(err, "Failed to load articles.")
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingArticles(false);
        }
      }
    };

    fetchArticles();
    return () => controller.abort();
  }, [username, activeTab, page, reloadArticlesTrigger]);

  // 3. Fetch followers/following list for modal
  useEffect(() => {
    if (!username || !activeModalTab) return;

    const controller = new AbortController();
    const fetchProfilesList = async () => {
      setIsLoadingProfilesList(true);
      setErrorMessagesProfilesList([]);
      try {
        let res;
        if (activeModalTab === "followers") {
          res = await getFollowers(username, controller.signal);
        } else {
          res = await getFollowing(username, controller.signal);
        }
        setProfilesList(res.profiles);
      } catch (err) {
        if (controller.signal.aborted) return;
        setErrorMessagesProfilesList(
          getApiErrorMessages(err, `Failed to load ${activeModalTab} list.`)
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProfilesList(false);
        }
      }
    };

    fetchProfilesList();
    return () => controller.abort();
  }, [username, activeModalTab]);

  const handleOpenListModal = (tab: "followers" | "following") => {
    setProfilesList([]);
    setActiveModalTab(tab);
  };

  const handleCloseListModal = () => {
    setActiveModalTab(null);
  };

  const handleToggleFollowInList = async (targetUsername: string, currentFollowing: boolean) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setTogglingFollowMap((prev) => ({ ...prev, [targetUsername]: true }));
    try {
      let res;
      if (currentFollowing) {
        res = await unfollowUser(targetUsername);
      } else {
        res = await followUser(targetUsername);
      }

      setProfilesList((prev) =>
        prev.map((p) => (p.username === targetUsername ? res.profile : p))
      );

      // If we are looking at our own profile, update our following count!
      if (isOwnProfile) {
        setProfile((prev) => {
          if (!prev) return null;
          const diff = currentFollowing ? -1 : 1;
          return {
            ...prev,
            followingCount: Math.max(0, (prev.followingCount || 0) + diff),
          };
        });
      }
    } catch (error) {
      console.error("Failed to toggle follow status in list", error);
    } finally {
      setTogglingFollowMap((prev) => ({ ...prev, [targetUsername]: false }));
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(articlesCount / PAGE_SIZE)),
    [articlesCount]
  );



  // 4. Handle Favorite toggle on article cards
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

      setArticles((prev) =>
        prev.map((art) => (art.slug === slug ? updatedArticle : art))
      );
    } catch (error) {
      console.error("Failed to toggle favorite status", error);
    } finally {
      setIsFavoritingMap((prev) => ({ ...prev, [slug]: false }));
    }
  };

  const [isFollowingInProgress, setIsFollowingInProgress] = useState(false);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!profile || isFollowingInProgress) return;

    setIsFollowingInProgress(true);
    try {
      let res;
      if (profile.following) {
        res = await unfollowUser(profile.username);
      } else {
        res = await followUser(profile.username);
      }
      setProfile(res.profile);
    } catch (error) {
      console.error("Failed to toggle follow status", error);
    } finally {
      setIsFollowingInProgress(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent, asDraft: boolean = false) => {
    if (e) e.preventDefault();
    if (isSubmittingPost || !composerTitle.trim() || !composerBody.trim() || composerTags.length === 0) {
      return;
    }

    setIsSubmittingPost(true);
    setComposerErrorMessages([]);

    try {
      const response = await createArticle({
        title: composerTitle.trim(),
        body: composerBody.trim(),
        tagList: composerTags,
        draft: asDraft,
      });

      if (!asDraft && activeTab === "authored") {
        setArticles((prev) => [response.article, ...prev]);
        setArticlesCount((prev) => prev + 1);
      } else if (asDraft && activeTab === "drafts") {
        setArticles((prev) => [response.article, ...prev]);
        setArticlesCount((prev) => prev + 1);
      }

      setComposerTitle("");
      setComposerBody("");
      setComposerTags([]);
      setIsComposerExpanded(false);
    } catch (error) {
      setComposerErrorMessages(
        getApiErrorMessages(error, "Failed to publish article.")
      );
    } finally {
      setIsSubmittingPost(false);
    }
  };



  if (isLoadingProfile) {
    return (
      <div className="profile-page-container" data-testid={TEST_ID.PROFILE.PAGE}>
        <div className="profile-banner-skeleton">Loading profile...</div>
      </div>
    );
  }

  if (errorMessagesProfile.length > 0 || !profile) {
    return (
      <div className="profile-page-container" data-testid={TEST_ID.PROFILE.PAGE}>
        <div className="form-error">
          <ul className="error-list">
            {errorMessagesProfile.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container" data-testid={TEST_ID.PROFILE.PAGE}>
      {/* Profile Header panel */}
      <header className="profile-header-banner" style={{ marginTop: "24px" }}>
        <div className="profile-header-card">
          <div className="profile-avatar-wrapper">
            <Avatar src={profile.image} alt={profile.username} />
          </div>
          <h1 className="profile-username">{profile.username}</h1>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          {profile.email && (
            <div className="profile-email" style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
              <strong>Email:</strong> {profile.email}
            </div>
          )}

          {/* Follower/Following stats */}
          <div className="profile-stats">
            <button 
              type="button" 
              className="profile-stat-btn"
              onClick={() => handleOpenListModal("following")}
            >
              <strong>{profile.followingCount || 0}</strong> following
            </button>
            <button 
              type="button" 
              className="profile-stat-btn"
              onClick={() => handleOpenListModal("followers")}
            >
              <strong>{profile.followersCount || 0}</strong> followers
            </button>
          </div>

          {!isOwnProfile && (
            <button
              className={`follow-toggle-btn ${profile.following ? "following" : ""}`}
              data-testid={TEST_ID.PROFILE.FOLLOW_BUTTON}
              onClick={handleFollowToggle}
              disabled={isFollowingInProgress}
              type="button"
              style={{ marginTop: "16px" }}
            >
              {profile.following ? "✓ Following" : "+ Follow"} {profile.username}
            </button>
          )}
        </div>
      </header>

      {/* Composer on Own Profile */}
      {isOwnProfile && (
        <section className="profile-composer-section" style={{ maxWidth: "760px", margin: "24px auto 0" }}>
          <div className={`feed-composer ${isComposerExpanded ? "expanded" : ""}`}>
            <form onSubmit={(e) => e.preventDefault()}>
              {composerErrorMessages.length > 0 && (
                <div className="form-error">
                  <ul className="error-list">
                    {composerErrorMessages.map((msg) => (
                      <li key={msg}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {!isComposerExpanded ? (
                <div 
                  className="composer-placeholder"
                  onClick={() => setIsComposerExpanded(true)}
                >
                  <div className="author-avatar small">
                    <Avatar src={currentUser.image} alt={currentUser.username} />
                  </div>
                  <span>Write a new article...</span>
                </div>
              ) : (
                <div className="composer-expanded-fields">
                  <div className="form-field">
                    <input
                      data-testid={TEST_ID.EDITOR.TITLE_INPUT}
                      disabled={isSubmittingPost}
                      placeholder="Article Title"
                      required
                      type="text"
                      value={composerTitle}
                      onChange={(e) => setComposerTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <textarea
                      data-testid={TEST_ID.EDITOR.BODY_INPUT}
                      disabled={isSubmittingPost}
                      placeholder="Write your article (markdown format supported)"
                      required
                      rows={4}
                      style={{
                        width: "100%",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        font: "inherit",
                        resize: "vertical",
                      }}
                      value={composerBody}
                      onChange={(e) => setComposerBody(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Tags</label>
                    <TagInput
                      disabled={isSubmittingPost}
                      tags={composerTags}
                      onChange={setComposerTags}
                    />
                  </div>
                  <div className="composer-actions">
                    <button
                      className="secondary-button compact-button"
                      disabled={isSubmittingPost}
                      type="button"
                      onClick={() => setIsComposerExpanded(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="secondary-button compact-button"
                      disabled={isSubmittingPost || !composerTitle.trim() || !composerBody.trim() || composerTags.length === 0}
                      type="button"
                      onClick={(e) => handleCreatePost(e, true)}
                      style={{ borderColor: "#3b82f6", color: "#3b82f6" }}
                    >
                      Save as Draft
                    </button>
                    <button
                      className="primary-button compact-button"
                      disabled={isSubmittingPost || !composerTitle.trim() || !composerBody.trim() || composerTags.length === 0}
                      type="button"
                      onClick={(e) => handleCreatePost(e, false)}
                    >
                      {isSubmittingPost ? "Publishing..." : "Publish Post"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>
      )}

      {/* Tabs and Article Lists */}
      <section className="profile-content-section" style={{ marginTop: "24px" }}>
        <div className="profile-tabs-nav" data-testid={TEST_ID.PROFILE.TABS}>
          <button
            className={`profile-tab-link ${activeTab === "authored" ? "active" : ""}`}
            data-testid={TEST_ID.PROFILE.MY_ARTICLES_TAB}
            type="button"
            onClick={() => {
              setActiveTab("authored");
              setPage(1);
            }}
          >
            {isOwnProfile ? "My Articles" : "Articles"}
          </button>
          {isOwnProfile && (
            <button
              className={`profile-tab-link ${activeTab === "favorited" ? "active" : ""}`}
              data-testid={TEST_ID.PROFILE.FAVORITED_ARTICLES_TAB}
              type="button"
              onClick={() => {
                setActiveTab("favorited");
                setPage(1);
              }}
            >
              Favorited Articles
            </button>
          )}
          {isOwnProfile && (
            <button
              className={`profile-tab-link ${activeTab === "drafts" ? "active" : ""}`}
              data-testid="profile-drafts-tab"
              type="button"
              onClick={() => {
                setActiveTab("drafts");
                setPage(1);
              }}
            >
              Draft Articles
            </button>
          )}
        </div>

        {isLoadingArticles ? (
          <div className="empty-state">Loading articles...</div>
        ) : errorMessagesArticles.length > 0 ? (
          <div className="form-error">
            <ul className="error-list">
              {errorMessagesArticles.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          </div>
        ) : articles.length === 0 ? (
          <div className="empty-state">No articles here... yet.</div>
        ) : (
          <div className="article-list">
            {(currentUser ? articles : articles.slice(0, 3)).map((article) => (
              <FeedArticleCard
                key={article.slug}
                article={article}
                currentUser={currentUser}
                onEdit={(art) => setEditingArticle(art)}
                onFavoriteToggle={handleFavoriteToggle}
                isFavoriting={!!isFavoritingMap[article.slug]}
                onDeleteSuccess={(slug) => {
                  setArticles((prev) => prev.filter((art) => art.slug !== slug));
                  setArticlesCount((prev) => prev - 1);
                }}
              />
            ))}
            {!currentUser && articlesCount > 3 && (
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

            {/* Pagination */}
            {currentUser && totalPages > 1 && (
              <nav className="pagination" aria-label="Profile pagination">
                <button
                  className="secondary-button compact-button"
                  disabled={page === 1}
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </nav>
            )}
          </div>
        )}
      </section>

      {/* Followers/Following Modal Pop-up */}
      {activeModalTab && (
        <div className="modal-overlay" onClick={handleCloseListModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>{activeModalTab === "followers" ? "Followers" : "Following"}</h2>
              <button className="modal-close-btn" onClick={handleCloseListModal} aria-label="Close modal">
                &times;
              </button>
            </header>
            <div className="modal-body" style={{ maxHeight: "400px", overflowY: "auto", padding: "16px 0" }}>
              {isLoadingProfilesList ? (
                <div className="empty-state">Loading users...</div>
              ) : errorMessagesProfilesList.length > 0 ? (
                <div className="form-error">
                  <ul className="error-list">
                    {errorMessagesProfilesList.map((msg) => (
                      <li key={msg}>{msg}</li>
                    ))}
                  </ul>
                </div>
              ) : profilesList.length === 0 ? (
                <div className="empty-state" style={{ border: "none" }}>
                  {activeModalTab === "followers" ? "No followers yet." : "Not following anyone yet."}
                </div>
              ) : (
                <div className="profiles-list-modal">
                  {profilesList.map((p) => {
                    const isSelf = currentUser && p.username === currentUser.username;
                    return (
                      <div key={p.username} className="profile-row-card-modal">
                        <div className="profile-row-left">
                          <Link 
                            to={`/profile/${p.username}`} 
                            className="author-avatar small"
                            onClick={handleCloseListModal}
                          >
                            <Avatar src={p.image} alt={p.username} />
                          </Link>
                          <div className="profile-row-info">
                            <Link 
                              to={`/profile/${p.username}`} 
                              className="profile-row-username"
                              onClick={handleCloseListModal}
                            >
                              <strong>{p.username}</strong>
                            </Link>
                            {p.bio && <p className="profile-row-bio">{p.bio}</p>}
                          </div>
                        </div>
                        {!isSelf && (
                          <button
                            className={`follow-toggle-btn compact-button ${p.following ? "following" : ""}`}
                            disabled={togglingFollowMap[p.username]}
                            onClick={() => handleToggleFollowInList(p.username, p.following)}
                            type="button"
                          >
                            {p.following ? "✓ Following" : "+ Follow"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editing Article Modal if triggered */}
      {editingArticle && (
        <ArticleEditorModal
          article={editingArticle}
          onClose={() => setEditingArticle(null)}
          onSuccess={() => {
            setReloadArticlesTrigger((prev) => prev + 1);
            setEditingArticle(null);
          }}
        />
      )}
    </div>
  );
}
