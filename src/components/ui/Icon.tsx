import type { CSSProperties } from "react";

interface IconProps {
  /** Phosphor icon name without the `ph-` prefix, e.g. `"scan"`. */
  name: string;
  weight?: "regular" | "fill";
  className?: string;
  style?: CSSProperties;
}

/** A Phosphor icon-font glyph, as used throughout the design. */
export function Icon({ name, weight = "regular", className, style }: IconProps) {
  const base = weight === "fill" ? "ph-fill" : "ph";
  return (
    <i
      aria-hidden="true"
      className={`${base} ph-${name}${className ? ` ${className}` : ""}`}
      style={style}
    />
  );
}
