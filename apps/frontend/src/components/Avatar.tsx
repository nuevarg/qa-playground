import { useState, useEffect } from "react";

type AvatarProps = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function Avatar({ src, alt = "", className = "", style }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={`default-avatar-svg ${className}`}
      fill="currentColor"
      style={style}
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}
