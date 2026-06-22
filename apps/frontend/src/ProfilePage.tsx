import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfile, followUser, unfollowUser } from "./api/profiles";
import {
  getArticles,
  favoriteArticle,
  unfavoriteArticle,
  type Article,
  type Profile,
} from "./api/articles";
import { getApiErrorMessages } from "./api/errors";
import { FeedArticleCard } from "./components/FeedArticleCard";
import { ArticleEditorModal } from "./components/ArticleEditorModal";
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
  onLogoutSuccess: () => void;
};

export function ProfilePage({ currentUser, onLogoutSuccess }: ProfilePageProps) {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogoutSuccess();
    navigate("/login");
  };

  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"authored" | "favorited">("authored");
  const [page, setPage] = useState(1);

  // Loaders & Errors
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [isFollowingSubmitting, setIsFollowingSubmitting] = useState(false);
  const [errorMessagesProfile, setErrorMessagesProfile] = useState<string[]>([]);
  const [errorMessagesArticles, setErrorMessagesArticles] = useState<string[]>([]);

  // Editing and Favoriting triggers
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isFavoritingMap, setIsFavoritingMap] = useState<Record<string, boolean>>({});

  const isOwnProfile = currentUser && profile && currentUser.username === profile.username;

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
            ...(activeTab === "authored" ? { author: username } : { favorited: username }),
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
  }, [username, activeTab, page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(articlesCount / PAGE_SIZE)),
    [articlesCount]
  );

  // 3. Handle Follow/Unfollow interaction
  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!profile || isFollowingSubmitting) return;

    setIsFollowingSubmitting(true);
    try {
      let updated;
      if (profile.following) {
        updated = await unfollowUser(profile.username);
      } else {
        updated = await followUser(profile.username);
      }
      setProfile(updated.profile);
    } catch (err) {
      alert("Failed to toggle follow status.");
    } finally {
      setIsFollowingSubmitting(false);
    }
  };

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

  const renderAvatarSvg = () => (
    <svg viewBox="0 0 24 24" className="default-avatar-svg" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

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
      {/* Profile Header Banner */}
      <header className="profile-header-banner">
        <div className="profile-header-card">
          <div className="profile-avatar-wrapper" data-testid={TEST_ID.PROFILE.AVATAR}>
            {profile.image ? (
              <img alt="" src={profile.image} />
            ) : (
              renderAvatarSvg()
            )}
          </div>
          <h1 className="profile-username" data-testid={TEST_ID.PROFILE.USERNAME}>
            {profile.username}
          </h1>
          <p className="profile-bio" data-testid={TEST_ID.PROFILE.BIO}>
            {profile.bio || "No bio bio available yet."}
          </p>

          {!isOwnProfile ? (
            <button
              className={`follow-toggle-btn ${profile.following ? "following" : ""}`}
              data-testid={TEST_ID.PROFILE.FOLLOW_BUTTON}
              disabled={isFollowingSubmitting}
              type="button"
              onClick={handleFollowToggle}
            >
              {profile.following ? "✓ Unfollow" : "+ Follow"} {profile.username}
            </button>
          ) : (
            currentUser && (
              <div className="owner-dashboard-details" data-testid={TEST_ID.DASHBOARD.CARD} style={{ width: "100%" }}>
                <hr className="divider" style={{ margin: "20px 0", border: "0", borderTop: "1px solid #cbd5e1" }} />
                <div className="dashboard-status-wrapper" style={{ marginBottom: "16px" }}>
                  <span className="status-badge">✓ Current user loaded</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value" data-testid={TEST_ID.DASHBOARD.EMAIL}>
                    {currentUser.email}
                  </span>
                </div>
                <div className="detail-row" style={{ marginTop: "8px" }}>
                  <span className="detail-label">Token</span>
                  <span className="token-value" data-testid={TEST_ID.DASHBOARD.TOKEN}>
                    {currentUser.token}
                  </span>
                </div>
                <div className="dashboard-actions" style={{ marginTop: "24px" }}>
                  <button
                    className="secondary-button"
                    data-testid={TEST_ID.DASHBOARD.LOGOUT_BUTTON}
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </header>

      {/* Tabs and Article Lists */}
      <section className="profile-content-section">
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
            My Articles
          </button>
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
            {articles.map((article) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
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

      {/* Editing Article Modal if triggered */}
      {editingArticle && (
        <ArticleEditorModal
          article={editingArticle}
          onClose={() => setEditingArticle(null)}
          onSuccess={(updatedArticle) => {
            setArticles((prev) =>
              prev.map((art) => (art.slug === editingArticle.slug ? updatedArticle : art))
            );
            setEditingArticle(null);
          }}
        />
      )}
    </div>
  );
}
