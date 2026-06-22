import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getArticle,
  getComments,
  addComment,
  deleteComment,
  deleteArticle,
  favoriteArticle,
  unfavoriteArticle,
  type Article,
  type Comment,
} from "./api/articles";
import { getApiErrorMessages } from "./api/errors";
import { TEST_ID } from "./constant/testIds.ts";
import { ArticleEditorModal } from "./components/ArticleEditorModal";

type CurrentUser = {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token: string;
};

type ArticleDetailProps = {
  currentUser: CurrentUser | null;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

function ArticleDetail({ currentUser }: ArticleDetailProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [commentErrorMessages, setCommentErrorMessages] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();
    const fetchArticleAndComments = async () => {
      setIsLoading(true);
      setErrorMessages([]);
      try {
        const [articleRes, commentsRes] = await Promise.all([
          getArticle(slug, controller.signal),
          getComments(slug, controller.signal),
        ]);
        setArticle(articleRes.article);
        setComments(commentsRes.comments);
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrorMessages(
          getApiErrorMessages(error, "Failed to load the article details.")
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchArticleAndComments();

    return () => controller.abort();
  }, [slug]);

  const handleFavoriteToggle = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!article || isFavoriting) return;

    setIsFavoriting(true);
    try {
      if (article.favorited) {
        const res = await unfavoriteArticle(article.slug);
        setArticle(res.article);
      } else {
        const res = await favoriteArticle(article.slug);
        setArticle(res.article);
      }
    } catch (error) {
      console.error("Failed to toggle favorite status", error);
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!article || isDeleting) return;
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    setIsDeleting(true);
    try {
      await deleteArticle(article.slug);
      navigate("/feed");
    } catch (error) {
      setErrorMessages(
        getApiErrorMessages(error, "Failed to delete the article.")
      );
      setIsDeleting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !commentBody.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    setCommentErrorMessages([]);
    try {
      const res = await addComment(slug, commentBody.trim());
      setComments((prev) => [res.comment, ...prev]);
      setCommentBody("");
    } catch (error) {
      setCommentErrorMessages(
        getApiErrorMessages(error, "Failed to post the comment.")
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!slug) return;
    try {
      await deleteComment(slug, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      setCommentErrorMessages(
        getApiErrorMessages(error, "Failed to delete the comment.")
      );
    }
  };

  if (isLoading) {
    return (
      <div className="feed-page" data-testid={TEST_ID.ARTICLE_DETAIL.PAGE}>
        <div className="empty-state">Loading article details...</div>
      </div>
    );
  }

  if (errorMessages.length > 0 || !article) {
    return (
      <div className="feed-page" data-testid={TEST_ID.ARTICLE_DETAIL.PAGE}>
        <div className="form-error">
          <ul className="error-list">
            {errorMessages.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link className="secondary-button" to="/feed">
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor =
    currentUser && article.author.username === currentUser.username;

  return (
    <div className="article-detail-container" data-testid={TEST_ID.ARTICLE_DETAIL.PAGE}>
      <header className="article-banner">
        <div className="banner-content">
          <h1 data-testid={TEST_ID.ARTICLE_DETAIL.TITLE}>{article.title}</h1>
          <div className="article-banner-meta">
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
            <div className="meta-text">
              <strong data-testid={TEST_ID.ARTICLE_DETAIL.AUTHOR}>
                {article.author.username}
              </strong>
              <span data-testid={TEST_ID.ARTICLE_DETAIL.DATE}>
                {formatDate(article.createdAt)}
              </span>
            </div>
            <div className="action-buttons">
              {isAuthor ? (
                <>
                  <button
                    className="secondary-button compact-button"
                    data-testid={TEST_ID.ARTICLE_DETAIL.EDIT_BUTTON}
                    type="button"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Article
                  </button>
                  <button
                    className="secondary-button compact-button danger-btn"
                    data-testid={TEST_ID.ARTICLE_DETAIL.DELETE_BUTTON}
                    disabled={isDeleting}
                    type="button"
                    onClick={handleDeleteArticle}
                  >
                    {isDeleting ? "Deleting..." : "Delete Article"}
                  </button>
                </>
              ) : (
                <button
                  className={`favorite-btn ${article.favorited ? "active" : ""}`}
                  data-testid={TEST_ID.ARTICLE_DETAIL.FAVORITE_BUTTON}
                  disabled={isFavoriting}
                  type="button"
                  onClick={handleFavoriteToggle}
                >
                  <span className="heart-icon">♥</span>{" "}
                  {article.favorited ? "Unfavorite" : "Favorite"}{" "}
                  <span className="fav-count">({article.favoritesCount})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="article-content-wrapper">
        <section className="article-body-section">
          <p className="article-description">{article.description}</p>
          <div
            className="article-body-content"
            data-testid={TEST_ID.ARTICLE_DETAIL.BODY}
          >
            {article.body.split("\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {article.tagList.length > 0 && (
            <div className="tag-list" style={{ marginTop: "24px" }}>
              {article.tagList.map((tag) => (
                <span className="tag-chip" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        <hr className="divider" />

        <section className="comments-section" data-testid={TEST_ID.COMMENTS.SECTION}>
          <h2>Comments</h2>

          {currentUser ? (
            <form className="comment-form" onSubmit={handleAddComment}>
              {commentErrorMessages.length > 0 && (
                <div className="form-error">
                  <ul className="error-list">
                    {commentErrorMessages.map((msg) => (
                      <li key={msg}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
              <textarea
                data-testid={TEST_ID.COMMENTS.INPUT}
                disabled={isSubmittingComment}
                placeholder="Write a comment..."
                rows={3}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
              />
              <div className="form-actions">
                <button
                  className="primary-button compact-button"
                  data-testid={TEST_ID.COMMENTS.SUBMIT_BUTTON}
                  disabled={isSubmittingComment || !commentBody.trim()}
                  type="submit"
                >
                  {isSubmittingComment ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <p className="login-prompt">
              Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to add comments on this article.
            </p>
          )}

          <div className="comment-list" data-testid={TEST_ID.COMMENTS.LIST}>
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div
                  className="comment-card"
                  data-testid={TEST_ID.COMMENTS.ITEM}
                  key={comment.id}
                >
                  <div className="comment-body">{comment.body}</div>
                  <div className="comment-meta">
                    <div className="comment-author-info">
                      <div className="author-avatar small">
                        {comment.author.image ? (
                          <img alt="" src={comment.author.image} />
                        ) : (
                          comment.author.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <strong>{comment.author.username}</strong>
                      <span className="comment-date">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    {currentUser &&
                      comment.author.username === currentUser.username && (
                        <button
                          className="comment-delete-btn"
                          data-testid={TEST_ID.COMMENTS.DELETE_BUTTON}
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          aria-label="Delete comment"
                        >
                          🗑
                        </button>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      {isEditing && (
        <ArticleEditorModal
          article={article}
          onClose={() => setIsEditing(false)}
          onSuccess={(updatedArticle) => {
            setArticle(updatedArticle);
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
}

export default ArticleDetail;
