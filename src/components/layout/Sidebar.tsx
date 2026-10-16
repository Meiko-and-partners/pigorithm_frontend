"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { MenuButton } from "@/components/ui/Menu";
import { useAuth, useFarmContext } from "@/lib/auth/AuthProvider";
import { initials, ROLE_LABEL } from "@/lib/status";
import { isActive, NAV_SECTIONS } from "./navigation";

interface SidebarProps {
  /** Called after a navigation link is chosen or the drawer's close button is pressed. */
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { user, role } = useFarmContext();

  return (
    <aside className="sidebar" id="app-sidebar" aria-label="Main navigation">
      <div className="brand">
        <div className="brandmark">
          <Icon name="heartbeat" weight="fill" />
        </div>
        <div>
          <div className="brandname">Pigorithm</div>
          <div className="brandsub">Livestock Intelligence</div>
        </div>
        <button type="button" className="sbclose" onClick={onClose} aria-label="Close navigation">
          <Icon name="x" />
        </button>
      </div>

      <nav className="navscroll">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="navsec">{section.title}</div>
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`navitem${active ? " active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={onClose}
                >
                  <Icon name={item.icon} />
                  <span className="navlabel">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <MenuButton
        label="Account menu"
        placement="above"
        buttonClassName="sbuser sbuserbtn"
        button={
          <>
            <Avatar initials={initials(user.firstName, user.lastName)} />
            <div className="min-w-0 flex-1">
              <div className="uname truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="urole">{role ? ROLE_LABEL[role] : "No role"}</div>
            </div>
            <Icon name="caret-up-down" style={{ color: "var(--sbmut)" }} />
          </>
        }
      >
        {(close) => (
          <>
            <div className="menulabel truncate normal-case tracking-normal">{user.email}</div>
            <button
              type="button"
              role="menuitem"
              className="menuitem"
              onClick={() => {
                close();
                void logout();
              }}
            >
              <Icon name="sign-out" />
              Sign out
            </button>
          </>
        )}
      </MenuButton>
    </aside>
  );
}
