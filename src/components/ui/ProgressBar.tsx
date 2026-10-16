interface ProgressBarProps {
  /** 0–100. */
  percent: number;
  color: string;
  label?: string;
}

/** Thin rounded progress track (battery level, barn coverage). */
export function ProgressBar({ percent, color, label }: ProgressBarProps) {
  return (
    <div
      className="pbar"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="pfill" style={{ width: `${percent}%`, background: color }} />
    </div>
  );
}
