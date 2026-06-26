import { useState, useEffect, useRef } from "react";
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
import { Avatar } from "./Avatar";

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



export function FeedArticleCard({
  article,
  currentUser,
  onEdit,
  onFavoriteToggle,
  isFavoriting,
  onDeleteSuccess,
}: FeedArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentErrorMessages, setCommentErrorMessages] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (commentInputRef.current) {
      commentInputRef.current.style.height = "auto";
      commentInputRef.current.style.height = `${commentInputRef.current.scrollHeight}px`;
    }
  }, [commentBody]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeMenu = () => setIsMenuOpen(false);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [isMenuOpen]);

  useEffect(() => {
    if (article.draft) return;
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
  }, [article.slug, article.draft]);

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

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!isBodyLong) return;
    const target = e.target as HTMLElement;
    const closestInteractive = target.closest("button, a, input, textarea, select, svg, img, h3, p, strong, span");
    if (closestInteractive) {
      return;
    }
    setIsExpanded((prev) => !prev);
  };

  return (
    <article
      className={`article-card ${isExpanded ? "expanded" : ""} ${isBodyLong ? "collapsible-card" : ""}`}
      data-testid={TEST_ID.FEED.ARTICLE_CARD}
      onClick={handleCardClick}
    >
      <div className="article-meta">
        <Link to={`/profile/${article.author.username}`} className="author-avatar">
          <Avatar src={article.author.image} alt={article.author.username} />
        </Link>
        <div>
          <Link to={`/profile/${article.author.username}`} className="author-username-link">
            <strong>{article.author.username}</strong>
          </Link>
          <span>
            {formatDate(article.createdAt)}
            {article.edited && (
              <span className="edited-label" style={{ marginLeft: "6px", color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>
                • Edited
              </span>
            )}
            {article.draft && (
              <span className="draft-badge" style={{ marginLeft: "8px", background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>
                Draft
              </span>
            )}
          </span>
        </div>
        <div className="card-owner-actions">
          <div className="card-menu-container">
            <button
              className="card-menu-toggle-btn"
              data-testid="card-menu-toggle"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              title="Article Actions"
              aria-label="Article actions"
            >
              ⋮
            </button>
            {isMenuOpen && (
              <div className="card-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                <button
                  className="card-menu-item"
                  data-testid="card-menu-favorite"
                  disabled={isFavoriting}
                  type="button"
                  onClick={() => {
                    onFavoriteToggle(article.slug, article.favorited);
                    setIsMenuOpen(false);
                  }}
                >
                  {article.favorited ? "♥ Unfavorite" : "♡ Favorite"} ({article.favoritesCount})
                </button>
                {isAuthor && (
                  <>
                    <button
                      className="card-menu-item"
                      data-testid="card-menu-edit"
                      type="button"
                      onClick={() => {
                        onEdit(article);
                        setIsMenuOpen(false);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="card-menu-item danger-item"
                      data-testid="card-menu-delete"
                      disabled={isDeleting}
                      type="button"
                      onClick={() => {
                        handleDeleteArticle();
                        setIsMenuOpen(false);
                      }}
                    >
                      🗑 Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <h3>
        {article.title}
      </h3>

      {!isExpanded ? (
        <div className="article-body-collapsed">
          <p>
            {bodyPreview}
            {isBodyLong && (
              <button
                className="read-more-link-inline"
                type="button"
                onClick={() => setIsExpanded(true)}
                style={{
                  display: "inline",
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: "0 0 0 8px",
                  color: "#2563eb",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
              >
                Read more →
              </button>
            )}
          </p>
          {article.tagList.length > 0 && (
            <div className="card-tags-line" style={{ marginTop: "12px" }}>
              {article.tagList.map((tag) => (
                <span className="tag-chip small" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
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
        </div>
      )}

      {!article.draft && (
        <>
          <hr className="divider" />

          <section className="comments-section" data-testid={TEST_ID.COMMENTS.SECTION}>
            {currentUser ? (
              <form className="comment-form-new" onSubmit={handleAddComment}>
                {commentErrorMessages.length > 0 && (
                  <div className="form-error">
                    <ul className="error-list">
                      {commentErrorMessages.map((msg) => (
                        <li key={msg}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="comment-input-container">
                  <textarea
                    ref={commentInputRef}
                    data-testid={TEST_ID.COMMENTS.INPUT}
                    disabled={isSubmittingComment}
                    placeholder="Write a comment..."
                    rows={1}
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                  />
                  <button
                    className="primary-button compact-button"
                    data-testid={TEST_ID.COMMENTS.SUBMIT_BUTTON}
                    disabled={isSubmittingComment || commentBody.trim().length < 3}
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
                      <div className="comment-card-header">
                        <div className="comment-author-info">
                          <Link to={`/profile/${comment.author.username}`} className="author-avatar small">
                            <Avatar src={comment.author.image} alt={comment.author.username} />
                          </Link>
                          <Link to={`/profile/${comment.author.username}`} className="author-username-link">
                            <strong>{comment.author.username}</strong>
                          </Link>
                          <span className="comment-date">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        {currentUser &&
                          (comment.author.username === currentUser.username || isAuthor) && (
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
                      <div className="comment-body" style={{ padding: "12px 16px", fontSize: "14px" }}>
                        {comment.body}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        </>
      )}
    </article>
  );
}
