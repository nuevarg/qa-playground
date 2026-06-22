import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getComments,
  addComment,
  deleteComment,
  deleteArticle,
  type Article,
  type Comment,
} from "../api/articles";
import { getApiErrorMessages } from "../api/errors";
import { TEST_ID } from "../constant/testIds.ts";

type CurrentUser = {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token: string;
};

type FeedArticleCardProps = {
  article: Article;
  currentUser: CurrentUser | null;
  onEdit: (article: Article) => void;
  onFavoriteToggle: (slug: string, isFavorited: boolean) => void;
  isFavoriting: boolean;
  onDeleteSuccess: (slug: string) => void;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const renderAvatarSvg = () => (
  <svg viewBox="0 0 24 24" className="default-avatar-svg" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

export function FeedArticleCard({
  article,
  currentUser,
  onEdit,
  onFavoriteToggle,
  isFavoriting,
  onDeleteSuccess,
}: FeedArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentErrorMessages, setCommentErrorMessages] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;

    const controller = new AbortController();
    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        const res = await getComments(article.slug, controller.signal);
        setComments(res.comments);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Failed to load comments", err);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingComments(false);
        }
      }
    };

    fetchComments();
    return () => controller.abort();
  }, [isExpanded, article.slug]);

  const handleDeleteArticle = async () => {
    if (isDeleting) return;
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    setIsDeleting(true);
    try {
      await deleteArticle(article.slug);
      onDeleteSuccess(article.slug);
    } catch (error) {
      alert("Failed to delete article. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    setCommentErrorMessages([]);
    try {
      const res = await addComment(article.slug, commentBody.trim());
      setComments((prev) => [res.comment, ...prev]);
      setCommentBody("");
    } catch (error) {
      setCommentErrorMessages(
        getApiErrorMessages(error, "Failed to post comment.")
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(article.slug, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      alert("Failed to delete comment.");
    }
  };

  const isAuthor =
    currentUser && article.author.username === currentUser.username;

  const isBodyLong = article.body.length > 200;
  const bodyPreview = isBodyLong
    ? article.body.substring(0, 200) + "..."
    : article.body;

  return (
    <article
      className={`article-card ${isExpanded ? "expanded" : ""}`}
      data-testid={TEST_ID.FEED.ARTICLE_CARD}
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
            renderAvatarSvg()
          )}
        </div>
        <div>
          <strong>{article.author.username}</strong>
          <span>{formatDate(article.createdAt)}</span>
        </div>
        <div className="card-owner-actions">
          {isAuthor ? (
            <>
              <button
                className="edit-card-btn icon-only-btn"
                type="button"
                onClick={() => onEdit(article)}
                title="Edit Article"
                aria-label="Edit article"
              >
                ✏️
              </button>
              <button
                className="edit-card-btn danger-btn-outline icon-only-btn"
                disabled={isDeleting}
                type="button"
                onClick={handleDeleteArticle}
                title={isDeleting ? "Deleting..." : "Delete Article"}
                aria-label="Delete article"
              >
                🗑
              </button>
            </>
          ) : (
            <button
              className={`favorite-pill-btn ${article.favorited ? "active" : ""}`}
              disabled={isFavoriting}
              type="button"
              onClick={() => onFavoriteToggle(article.slug, article.favorited)}
            >
              <span className="heart-icon">♥</span> {article.favoritesCount}
            </button>
          )}
        </div>
      </div>

      <h3
        style={{ cursor: "pointer" }}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {article.title}
      </h3>

      {!isExpanded ? (
        <div className="article-body-collapsed">
          <p>{bodyPreview}</p>
          {article.tagList.length > 0 && (
            <div className="card-tags-line">
              {article.tagList.slice(0, 5).map((tag) => (
                <span className="tag-chip small" key={tag}>
                  {tag}
                </span>
              ))}
              {article.tagList.length > 5 && (
                <span className="tag-chip small more-tag-chip" title={article.tagList.slice(5).join(", ")}>
                  ...
                </span>
              )}
            </div>
          )}
          {isBodyLong && (
            <button
              className="read-more-link"
              type="button"
              onClick={() => setIsExpanded(true)}
            >
              Read more →
            </button>
          )}
        </div>
      ) : (
        <div className="article-body-expanded" data-testid={TEST_ID.ARTICLE_DETAIL.BODY}>
          {article.body.split("\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <div className="article-footer" style={{ marginTop: "24px" }}>
            <button
              className="read-more-link"
              type="button"
              onClick={() => setIsExpanded(false)}
            >
              Show less ↑
            </button>
            <div className="tag-list">
              {article.tagList.map((tag) => (
                <span className="tag-chip" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <hr className="divider" />

          <section className="comments-section" data-testid={TEST_ID.COMMENTS.SECTION}>
            <h3>Comments</h3>

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
                  rows={2}
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
                    {isSubmittingComment ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>
            ) : (
              <p className="login-prompt" style={{ padding: "12px", fontSize: "14px" }}>
                Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to comment.
              </p>
            )}

            {isLoadingComments ? (
              <p className="no-comments">Loading comments...</p>
            ) : (
              <div className="comment-list" data-testid={TEST_ID.COMMENTS.LIST}>
                {comments.length === 0 ? (
                  <p className="no-comments">No comments yet.</p>
                ) : (
                  comments.map((comment) => (
                    <div
                      className="comment-card"
                      data-testid={TEST_ID.COMMENTS.ITEM}
                      key={comment.id}
                    >
                      <div className="comment-body" style={{ padding: "12px 16px", fontSize: "14px" }}>
                        {comment.body}
                      </div>
                      <div className="comment-meta" style={{ padding: "8px 16px" }}>
                        <div className="comment-author-info">
                          <div className="author-avatar small">
                            {comment.author.image ? (
                              <img alt="" src={comment.author.image} />
                            ) : (
                              renderAvatarSvg()
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
            )}
          </section>
        </div>
      )}
    </article>
  );
}
