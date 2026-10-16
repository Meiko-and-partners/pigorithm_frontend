import type { ReactNode } from "react";

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return <div className={`card${className ? ` ${className}` : ""}`}>{children}</div>;
}

interface CardHeaderProps {
  title: ReactNode;
  sub?: ReactNode;
  /** Right-aligned content: a badge or a "View all" link. */
  action?: ReactNode;
}

export function CardHeader({ title, sub, action }: CardHeaderProps) {
  return (
    <div className="cardhead">
      <div>
        <div className="cardtitle">{title}</div>
        {sub && <div className="cardsub">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

/** A table inside the design's bordered table card, scrollable when narrow. */
export function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="tablecard">
      <div className="tablescroll">{children}</div>
    </div>
  );
}
