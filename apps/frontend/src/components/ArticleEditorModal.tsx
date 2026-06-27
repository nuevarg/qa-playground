import React, { useState, useEffect } from "react";
import { updateArticle, type Article } from "../api/articles";
import { getApiErrorMessages } from "../api/errors";
import { TagInput } from "./TagInput";
import { TEST_ID } from "../constant/testIds.ts";
import { ConfirmationModal } from "./ConfirmationModal";

type ArticleEditorModalProps = {
  /** The current loaded article details to populate default values */
  article: Article;
  /** Callback fired when the user closes the modal without submitting changes */
  onClose: () => void;
  /** Callback fired when the article is successfully updated in the database */
  onSuccess: (updatedArticle: Article) => void;
};

/**
 * Modal dialog for editing existing articles.
 * Traps background scrolling on mount, supports live tag updates,
 * and performs dirty-state checks before closing/cancelling.
 */
export function ArticleEditorModal({
  article,
  onClose,
  onSuccess,
}: ArticleEditorModalProps) {
  const [title, setTitle] = useState(article.title);
  const [body, setBody] = useState(article.body);
  const [tagList, setTagList] = useState<string[]>(article.tagList);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Confirmation overlay states
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Prevent background scrolling while editing
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  /**
   * Submits the updated article details to the backend API services.
   */
  const handleSubmit = async (e: React.FormEvent | null, asDraft: boolean = false) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessages([]);

    try {
      const result = await updateArticle(article.slug, {
        title: title.trim(),
        body: body.trim(),
        tagList,
        draft: asDraft,
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

  /**
   * Compares current input state with original values.
   * If unchanged, closes the modal immediately. Otherwise, warns the user.
   */
  const handleCancelClick = () => {
    const hasChanges =
      title.trim() !== article.title.trim() ||
      body.trim() !== article.body.trim() ||
      JSON.stringify(tagList.sort()) !== JSON.stringify([...article.tagList].sort());

    if (!hasChanges) {
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
          <h2>Edit Article</h2>
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
              disabled={isSubmitting || !title || !body}
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              style={{ borderColor: "#3b82f6", color: "#3b82f6" }}
            >
              Save as Draft
            </button>
            <button
              className="primary-button compact-button"
              data-testid={TEST_ID.EDITOR.SUBMIT_BUTTON}
              disabled={isSubmitting || !title || !body}
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
            >
              {isSubmitting ? "Saving..." : article.draft ? "Publish Article" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationModal
        isOpen={showCancelConfirm}
        title="Discard Changes"
        message="Are you sure you want to discard your edits? Any unsaved changes will be lost."
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
        title={article.draft ? "Publish Article" : "Save Changes"}
        message={
          article.draft
            ? "Are you sure you want to publish this draft article?"
            : "Are you sure you want to save the changes to this article?"
        }
        confirmText="Confirm"
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
