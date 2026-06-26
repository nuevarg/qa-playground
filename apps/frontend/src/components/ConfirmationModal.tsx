import React, { useEffect } from "react";

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = "No",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
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
