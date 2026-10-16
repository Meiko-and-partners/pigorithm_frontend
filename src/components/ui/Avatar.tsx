interface AvatarProps {
  initials: string;
  /** CSS background (colour or gradient); defaults to the brand gradient. */
  background?: string;
  size?: number;
}

export function Avatar({ initials, background, size }: AvatarProps) {
  const style = {
    ...(background ? { background } : {}),
    ...(size ? { width: size, height: size, fontSize: size <= 32 ? 12 : 13 } : {}),
  };
  return (
    <div className="avatar" style={style} aria-hidden="true">
      {initials}
    </div>
  );
}
