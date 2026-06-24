import React, { useState } from "react";

type TagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
};

export function TagInput({ tags, onChange, disabled }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (value: string) => {
    const trimmed = value.trim().replace(/,/g, "");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "") {
      e.preventDefault();
      if (tags.length > 0) {
        removeTag(tags.length - 1);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith(",")) {
      addTag(value);
    } else {
      setInputValue(value);
    }
  };

  const handleBlur = () => {
    addTag(inputValue);
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className={`tag-input-wrapper ${disabled ? "disabled" : ""}`} data-testid="tag-input-container">
      {tags.map((tag, idx) => (
        <span className="tag-input-pill" data-testid="tag-input-pill" key={`${tag}-${idx}`}>
          {tag}
          <button
            data-testid="tag-input-remove"
            disabled={disabled}
            type="button"
            onClick={() => removeTag(idx)}
            aria-label={`Remove tag ${tag}`}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        data-testid="tag-input-field"
        disabled={disabled}
        placeholder={tags.length === 0 ? "Type tag & press comma..." : ""}
        type="text"
        value={inputValue}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
