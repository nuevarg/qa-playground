import React, { useState, useEffect } from "react";
import { updateArticle, type Article } from "../api/articles";
import { getApiErrorMessages } from "../api/errors";
import { TagInput } from "./TagInput";
import { TEST_ID } from "../constant/testIds.ts";

type ArticleEditorModalProps = {
  article: Article;
  onClose: () => void;
  onSuccess: (updatedArticle: Article) => void;
};

export function ArticleEditorModal({
  article,
  onClose,
  onSuccess,
}: ArticleEditorModalProps) {
  const [title, setTitle] = useState(article.title);
  const [description, setDescription] = useState(article.description);
  const [body, setBody] = useState(article.body);
  const [tagList, setTagList] = useState<string[]>(article.tagList);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessages([]);

    try {
      const result = await updateArticle(article.slug, {
        title: title.trim(),
        description: description.trim(),
        body: body.trim(),
        tagList,
      });
      onSuccess(result.article);
    } catch (error) {
      setErrorMessages(
        getApiErrorMessages(error, "Failed to update article.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      data-testid={TEST_ID.EDITOR.PAGE}
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>Edit Article</h2>
          <button
            className="close-button"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          {errorMessages.length > 0 && (
            <div className="form-error" data-testid={TEST_ID.EDITOR.ERROR}>
              <ul className="error-list">
                {errorMessages.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="modal-title">Title</label>
            <input
              id="modal-title"
              data-testid={TEST_ID.EDITOR.TITLE_INPUT}
              disabled={isSubmitting}
              placeholder="Article Title"
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="modal-description">Description</label>
            <input
              id="modal-description"
              data-testid={TEST_ID.EDITOR.DESC_INPUT}
              disabled={isSubmitting}
              placeholder="What's this article about?"
              required
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="modal-body">Body</label>
            <textarea
              id="modal-body"
              data-testid={TEST_ID.EDITOR.BODY_INPUT}
              disabled={isSubmitting}
              placeholder="Write your article (markdown format supported)"
              required
              rows={6}
              style={{
                width: "100%",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "12px 14px",
                font: "inherit",
                resize: "vertical",
              }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Tags</label>
            <TagInput
              disabled={isSubmitting}
              tags={tagList}
              onChange={setTagList}
            />
          </div>

          <div className="modal-actions">
            <button
              className="secondary-button compact-button"
              disabled={isSubmitting}
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="primary-button compact-button"
              data-testid={TEST_ID.EDITOR.SUBMIT_BUTTON}
              disabled={isSubmitting || !title || !description || !body}
              type="submit"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
