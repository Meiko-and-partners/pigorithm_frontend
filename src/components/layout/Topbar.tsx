"use client";

import { Icon } from "@/components/ui/Icon";
import { MenuButton } from "@/components/ui/Menu";
import { backend } from "@/lib/api/backend";
import { useApiQuery } from "@/lib/api/useApiQuery";
import { useAuth, useFarmContext } from "@/lib/auth/AuthProvider";
import { formatCount } from "@/lib/format";

interface TopbarProps {
  navOpen: boolean;
  onOpenNav: () => void;
}

export function Topbar({ navOpen, onOpenNav }: TopbarProps) {
  const { selectFarm } = useAuth();
  const { farm, farms } = useFarmContext();
  const collars = useApiQuery(`${farm.id}:collars`, (signal) =>
    backend.listCollars(farm.id, signal),
  );
  const activeCollars =
    collars.status === "success" ? collars.data.filter((c) => c.status === "ACTIVE").length : null;

  return (
    <header className="topbar">
      <button
        type="button"
        className="iconbtn menubtn"
        onClick={onOpenNav}
        aria-label="Open navigation"
        aria-controls="app-sidebar"
        aria-expanded={navOpen}
      >
        <Icon name="list" />
      </button>
      <MenuButton
        label={`Current farm: ${farm.name}. Switch farm`}
        placement="below"
        buttonClassName="farmsel"
        button={
          <>
            <Icon name="barn" />
            <span className="farmname">{farm.name}</span>
            <Icon name="caret-down" style={{ fontSize: 12, color: "var(--muted2)" }} />
          </>
        }
      >
        {(close) => (
          <>
            <div className="menulabel">Your farms</div>
            {farms.map((f) => (
              <button
                key={f.id}
                type="button"
                role="menuitemradio"
                aria-checked={f.id === farm.id}
                className={`menuitem${f.id === farm.id ? " current" : ""}`}
                onClick={() => {
                  selectFarm(f.id);
                  close();
                }}
              >
                <Icon name={f.id === farm.id ? "check" : "barn"} />
                <span className="flex-1 truncate">{f.name}</span>
                <span className="mono text-[11.5px] text-muted2">{f.farmCode}</span>
              </button>
            ))}
          </>
        )}
      </MenuButton>
      <div className="searchwrap">
        <Icon name="magnifying-glass" />
        <input
          className="searchinput"
          placeholder="Search pigs, pens, devices, cases…"
          aria-label="Search (not available yet)"
          title="Search isn't available yet"
          disabled
        />
      </div>
      <div className="spacer" />
      {activeCollars !== null && (
        <div className="live">
          <span className="livedot" />
          {formatCount(activeCollars)} active {activeCollars === 1 ? "collar" : "collars"}
        </div>
      )}
      <button type="button" className="iconbtn" aria-label="Notifications (not available yet)" title="Notifications aren't available yet" disabled>
        <Icon name="bell" />
      </button>
      <button type="button" className="iconbtn helpbtn" aria-label="Help (not available yet)" title="Help isn't available yet" disabled>
        <Icon name="question" />
      </button>
    </header>
  );
}
