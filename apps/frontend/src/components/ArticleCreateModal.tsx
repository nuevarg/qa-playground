import React, { useState, useEffect } from "react";
import { createArticle, type Article } from "../api/articles";
import { getApiErrorMessages } from "../api/errors";
import { TagInput } from "./TagInput";
import { TEST_ID } from "../constant/testIds.ts";
import { ConfirmationModal } from "./ConfirmationModal";

type ArticleCreateModalProps = {
  /** Callback fired when the user closes the modal without submitting */
  onClose: () => void;
  /** Callback fired when the article is successfully created/published */
  onSuccess: (newArticle: Article, asDraft: boolean) => void;
};

/**
 * Modal dialog for creating and publishing new articles.
 * Mounts full-screen overlay, locks background scrolls, and handles validation/draft confirmations.
 */
export function ArticleCreateModal({
  onClose,
  onSuccess,
}: ArticleCreateModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagList, setTagList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Confirmation overlay states
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Prevent background scrolling while the creation modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  /**
   * Submits the form data to the backend API.
   * Handles both normal publishing and saving as draft.
   */
  const handleSubmit = async (e: React.FormEvent | null, asDraft: boolean = false) => {
    if (e) e.preventDefault();
    if (isSubmitting || !title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    setErrorMessages([]);

    try {
      const response = await createArticle({
        title: title.trim(),
        body: body.trim(),
        tagList,
        draft: asDraft,
      });
      onSuccess(response.article, asDraft);
    } catch (error) {
      setErrorMessages(
        getApiErrorMessages(error, "Failed to create article.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Checks if user has typed anything before showing the discard confirmation dialog.
   * Empty forms close immediately.
   */
  const handleCancelClick = () => {
    if (!title.trim() && !body.trim() && tagList.length === 0) {
      onClose();
    } else {
      setShowCancelConfirm(true);
    }
  };

  return (
    <div
      className="modal-overlay"
      data-testid={TEST_ID.EDITOR.PAGE}
      onClick={handleCancelClick}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>Create Article</h2>
          <button
            className="close-button"
            type="button"
            onClick={handleCancelClick}
            aria-label="Close modal"
          >
            &times;
          </button>
        </header>

        <form onSubmit={(e) => e.preventDefault()}>
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
              onClick={handleCancelClick}
            >
              Cancel
            </button>
            <button
              className="secondary-button compact-button"
              disabled={isSubmitting || !title.trim() || !body.trim()}
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              style={{ borderColor: "#3b82f6", color: "#3b82f6" }}
            >
              Save as Draft
            </button>
            <button
              className="primary-button compact-button"
              data-testid={TEST_ID.EDITOR.SUBMIT_BUTTON}
              disabled={isSubmitting || !title.trim() || !body.trim()}
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
            >
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationModal
        isOpen={showCancelConfirm}
        title="Discard Changes"
        message="Are you sure you want to discard your draft? Any unsaved changes will be lost."
        confirmText="Discard"
        cancelText="Cancel"
        onConfirm={() => {
          setShowCancelConfirm(false);
          onClose();
        }}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <ConfirmationModal
        isOpen={showSubmitConfirm}
        title="Publish Article"
        message="Are you sure you want to publish this article to the feed?"
        confirmText="Publish"
        cancelText="Cancel"
        onConfirm={() => {
          setShowSubmitConfirm(false);
          handleSubmit(null, false);
        }}
        onCancel={() => setShowSubmitConfirm(false)}
      />
    </div>
  );
}
