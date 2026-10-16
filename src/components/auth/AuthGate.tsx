"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { snapshotOf, useAuth } from "@/lib/auth/AuthProvider";
import { redirectFor, type PageArea } from "@/lib/auth/routing";
import { Icon } from "@/components/ui/Icon";

/**
 * Client-side route guard. The `proxy` already turns away requests without a
 * session cookie; this waits for the session to be confirmed with the backend
 * and routes the user to login, onboarding or the app as appropriate.
 * Authorization itself is always enforced by the backend.
 */
export function AuthGate({ area, children }: { area: PageArea; children: ReactNode }) {
  const { state, retry } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const target = redirectFor(
    snapshotOf(state),
    area,
    query ? `${pathname}?${query}` : pathname,
    searchParams.get("next"),
  );

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (state.status === "error") {
    return (
      <FullScreenState
        icon="cloud-slash"
        title="Can't reach Pigorithm"
        text={state.message}
        action={
          <button type="button" className="btn btn-primary" onClick={retry}>
            <Icon name="arrows-clockwise" />
            Try again
          </button>
        }
      />
    );
  }
  if (state.status === "loading" || target) {
    // Auth pages render immediately for signed-out visitors; elsewhere wait.
    if (area === "auth" && state.status === "loading") return <>{children}</>;
    return <FullScreenState icon="spinner-gap" spin title="Loading Pigorithm…" />;
  }
  return <>{children}</>;
}

function FullScreenState({
  icon,
  title,
  text,
  action,
  spin,
}: {
  icon: string;
  title: string;
  text?: string;
  action?: ReactNode;
  spin?: boolean;
}) {
  return (
    <div className="authwrap" role="status" aria-live="polite">
      <div className="statebox">
        <div className="stateicon t-rose">
          <Icon name={icon} className={spin ? "spin" : undefined} />
        </div>
        <div className="statetitle">{title}</div>
        {text && <div className="statetext">{text}</div>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
