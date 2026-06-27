import React, { useEffect } from "react";

type ConfirmationModalProps = {
  /** Determines if the confirmation modal overlay is visible */
  isOpen: boolean;
  /** Title text shown in the header of the confirmation popup */
  title: string;
  /** Primary description/alert message asking for confirmation */
  message: string;
  /** Text labeled on the primary confirmation action button */
  confirmText: string;
  /** Text labeled on the cancel action button. Defaults to "No" */
  cancelText?: string;
  /** Callback fired when the user confirms the action */
  onConfirm: () => void;
  /** Callback fired when the user cancels the confirmation dialog */
  onCancel: () => void;
};

/**
 * Reusable dialog component displaying high-priority actions (z-index: 2000).
 * Temporarily locks the background body scrolling when opened.
 */
export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = "No",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  // Prevent background scrolling while the confirmation pop-up is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }} onClick={onCancel}>
      <div
        className="modal-card"
        style={{ maxWidth: "400px", padding: "24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header" style={{ marginBottom: "16px", paddingBottom: "8px" }}>
          <h2 style={{ fontSize: "18px" }}>{title}</h2>
          <button className="close-button" type="button" onClick={onCancel} aria-label="Close">
            &times;
          </button>
        </header>
        <div style={{ marginBottom: "24px", color: "#475569", fontSize: "14px", lineHeight: "1.5" }}>
          {message}
        </div>
        <div className="modal-actions" style={{ marginTop: "0" }}>
          <button className="secondary-button compact-button" type="button" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="primary-button compact-button" type="button" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
