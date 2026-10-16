import type { ApiClient } from "./client";
import type {
  Collar,
  CollarAssignment,
  CreateFarmRequest,
  Farm,
  Gateway,
  Membership,
  Pig,
  RegisterRequest,
  User,
} from "./types";

/**
 * Typed wrappers for the backend endpoints the web app uses. Paths are
 * relative to NEXT_PUBLIC_API_URL (the `/api/v1` root). Login, refresh and
 * logout go through the `/api/auth/*` route handlers instead (see
 * `lib/auth/session.ts`).
 */
export function endpoints(client: ApiClient) {
  const farm = (farmId: string) => `/farms/${encodeURIComponent(farmId)}`;
  return {
    /** POST /auth/register (public). Creates the user only — no farm. */
    register: (body: RegisterRequest) =>
      client.request<User>("/auth/register", { method: "POST", body, auth: false }),
    me: (signal?: AbortSignal) => client.request<User>("/auth/me", { signal }),

    listFarms: (signal?: AbortSignal) => client.request<Farm[]>("/farms", { signal }),
    /** POST /farms — the caller becomes the farm's ACTIVE OWNER atomically. */
    createFarm: (body: CreateFarmRequest) =>
      client.request<Farm>("/farms", { method: "POST", body }),
    listMemberships: (signal?: AbortSignal) =>
      client.request<Membership[]>("/memberships", { signal }),

    listPigs: (farmId: string, signal?: AbortSignal) =>
      client.request<Pig[]>(`${farm(farmId)}/pigs`, { signal }),
    getPig: (farmId: string, pigId: string, signal?: AbortSignal) =>
      client.request<Pig>(`${farm(farmId)}/pigs/${encodeURIComponent(pigId)}`, { signal }),
    listCollars: (farmId: string, signal?: AbortSignal) =>
      client.request<Collar[]>(`${farm(farmId)}/collars`, { signal }),
    listGateways: (farmId: string, signal?: AbortSignal) =>
      client.request<Gateway[]>(`${farm(farmId)}/gateways`, { signal }),
    /** OWNER only; 404 when the pig has no active collar. */
    currentCollarForPig: (farmId: string, pigId: string, signal?: AbortSignal) =>
      client.request<CollarAssignment>(
        `${farm(farmId)}/collar-assignments/pig/${encodeURIComponent(pigId)}/current`,
        { signal },
      ),
  };
}

export type Endpoints = ReturnType<typeof endpoints>;
