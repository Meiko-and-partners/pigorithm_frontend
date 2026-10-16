import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, sub, actions }: PageHeaderProps) {
  return (
    <div className="pagehead">
      <div>
        <h1 className="h1">{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
