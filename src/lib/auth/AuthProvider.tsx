"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { endpoints } from "@/lib/api/endpoints";
import { errorMessage } from "@/lib/api/errors";
import type {
  CreateFarmRequest,
  Farm,
  LoginRequest,
  Membership,
  RegisterRequest,
  Role,
  User,
} from "@/lib/api/types";
import type { SessionSnapshot } from "./routing";
import * as session from "./session";

export interface Account {
  user: User;
  farms: Farm[];
  memberships: Membership[];
}

export type AuthState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "unauthenticated"; expired?: boolean }
  | ({ status: "authenticated"; farmId: string | null } & Account);

interface AuthContextValue {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<Account>;
  /** Registers the user, then signs them in. */
  register: (details: RegisterRequest) => Promise<Account>;
  logout: () => Promise<void>;
  /** Creates a farm owned by the current user and makes it the current farm. */
  createFarm: (details: CreateFarmRequest) => Promise<Farm>;
  selectFarm: (farmId: string) => void;
  retry: () => void;
}

/** The account was created, but the automatic sign-in that follows failed. */
export class SignInAfterRegisterError extends Error {
  constructor(readonly cause: unknown) {
    super("Account created, but signing in failed");
    this.name = "SignInAfterRegisterError";
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

const api = endpoints(session.api);
const FARM_KEY = "pigorithm.farmId";

/** The farm the user last chose, if they still belong to it. */
function pickFarm(farms: Farm[]): string | null {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(FARM_KEY);
  } catch {
    // Storage blocked: fall back to the first farm.
  }
  return farms.find((f) => f.id === stored)?.id ?? farms[0]?.id ?? null;
}

function rememberFarm(farmId: string): void {
  try {
    window.localStorage.setItem(FARM_KEY, farmId);
  } catch {
    // Not critical.
  }
}

async function loadAccount(): Promise<Account> {
  const [user, farms, memberships] = await Promise.all([
    api.me(),
    api.listFarms(),
    api.listMemberships(),
  ]);
  return { user, farms, memberships };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  const applyAccount = useCallback((account: Account) => {
    setState({ status: "authenticated", farmId: pickFarm(account.farms), ...account });
    return account;
  }, []);

  // Restore the session on first load (and on retry).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!session.hasSessionHint()) {
        if (!cancelled) setState({ status: "unauthenticated" });
        return;
      }
      try {
        const token = await session.refreshAccessToken();
        if (!token) {
          if (!cancelled) setState({ status: "unauthenticated" });
          return;
        }
        const account = await loadAccount();
        if (!cancelled) applyAccount(account);
      } catch (error) {
        if (!cancelled) setState({ status: "error", message: errorMessage(error) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt, applyAccount]);

  // Any request that finds the session gone signs the user out.
  useEffect(() => {
    const onExpired = () => setState({ status: "unauthenticated", expired: true });
    window.addEventListener(session.SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(session.SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      await session.login(credentials);
      return applyAccount(await loadAccount());
    },
    [applyAccount],
  );

  const register = useCallback(
    async (details: RegisterRequest) => {
      await api.register(details);
      try {
        return await login({ email: details.email, password: details.password });
      } catch (error) {
        throw new SignInAfterRegisterError(error);
      }
    },
    [login],
  );

  const logout = useCallback(async () => {
    await session.logout();
    setState({ status: "unauthenticated" });
  }, []);

  const createFarm = useCallback(async (details: CreateFarmRequest) => {
    const farm = await api.createFarm(details);
    const [farms, memberships] = await Promise.all([api.listFarms(), api.listMemberships()]);
    rememberFarm(farm.id);
    setState((prev) =>
      prev.status === "authenticated" ? { ...prev, farms, memberships, farmId: farm.id } : prev,
    );
    return farm;
  }, []);

  const selectFarm = useCallback((farmId: string) => {
    rememberFarm(farmId);
    setState((prev) => (prev.status === "authenticated" ? { ...prev, farmId } : prev));
  }, []);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({ state, login, register, logout, createFarm, selectFarm, retry }),
    [state, login, register, logout, createFarm, selectFarm, retry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

export function snapshotOf(state: AuthState): SessionSnapshot {
  if (state.status === "authenticated") {
    return { status: "authenticated", farmCount: state.farms.length };
  }
  return state;
}

/** The caller's ACTIVE role on a farm, if any. */
export function roleOn(memberships: Membership[], userId: string, farmId: string): Role | null {
  return (
    memberships.find((m) => m.userId === userId && m.farmId === farmId && m.status === "ACTIVE")
      ?.role ?? null
  );
}

export interface FarmContext {
  user: User;
  farm: Farm;
  role: Role | null;
  farms: Farm[];
  memberships: Membership[];
}

/**
 * The signed-in user and their current farm. Only valid inside pages guarded
 * by <AuthGate area="app">, which guarantees both exist.
 */
export function useFarmContext(): FarmContext {
  const { state } = useAuth();
  if (state.status !== "authenticated") throw new Error("Not signed in");
  const farm = state.farms.find((f) => f.id === state.farmId) ?? state.farms[0];
  if (!farm) throw new Error("No farm selected");
  return {
    user: state.user,
    farm,
    role: roleOn(state.memberships, state.user.id, farm.id),
    farms: state.farms,
    memberships: state.memberships,
  };
}
