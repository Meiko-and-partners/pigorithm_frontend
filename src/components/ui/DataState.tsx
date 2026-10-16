import type { ReactNode } from "react";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { Icon } from "./Icon";

interface StateProps {
  icon: string;
  tone?: "rose" | "mut" | "err" | "warn";
  title: string;
  text?: ReactNode;
  action?: ReactNode;
}

/** Centred icon, title and text — the base of every data state. */
export function StateMessage({ icon, tone = "mut", title, text, action }: StateProps) {
  return (
    <div className="statebox">
      <div className={`stateicon t-${tone}`}>
        <Icon name={icon} />
      </div>
      <div className="statetitle">{title}</div>
      {text && <div className="statetext">{text}</div>}
      {action && <div className="mt-3.5">{action}</div>}
    </div>
  );
}

/** The backend doesn't expose this data yet. */
export function Unavailable({ title, text }: { title: string; text?: ReactNode }) {
  return <StateMessage icon="plugs" title={title} text={text} />;
}

export function EmptyState({ icon, title, text }: { icon: string; title: string; text?: ReactNode }) {
  return <StateMessage icon={icon} title={title} text={text} />;
}

/** A failed request, with a retry button. 403s explain the role restriction. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const forbidden = error instanceof ApiError && error.kind === "forbidden";
  return (
    <StateMessage
      icon={forbidden ? "lock-simple" : "warning-circle"}
      tone={forbidden ? "mut" : "err"}
      title={forbidden ? "Not available for your role" : "Couldn't load this"}
      text={errorMessage(error)}
      action={
        onRetry && !forbidden ? (
          <button type="button" className="btn btn-ghost" onClick={onRetry}>
            <Icon name="arrows-clockwise" />
            Try again
          </button>
        ) : undefined
      }
    />
  );
}

/** Placeholder rows while a list loads. */
export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3 py-2" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-[18px]" style={{ width: `${92 - i * 9}%` }} />
      ))}
    </div>
  );
}

/** Inline placeholder for a value the backend doesn't provide. */
export function NotAvailable({ label = "Not available yet" }: { label?: string }) {
  return (
    <span className="na" title={label} aria-label={label}>
      —
    </span>
  );
}
