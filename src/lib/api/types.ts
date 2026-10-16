/**
 * Request and response contracts of the Pigorithm NestJS API (`/api/v1`),
 * mirrored from the backend DTOs. Dates arrive as ISO-8601 strings.
 */

export type Role = "OWNER" | "WORKER" | "VETERINARIAN";
export type UserStatus = "ACTIVE" | "INACTIVE";
export type FarmStatus = "ACTIVE" | "INACTIVE";
export type MembershipStatus = "ACTIVE" | "INACTIVE";
export type GatewayStatus = "ACTIVE" | "INACTIVE" | "OFFLINE";
export type CollarStatus = "ACTIVE" | "INACTIVE" | "OFFLINE";
export type PigStatus = "ACTIVE" | "SOLD" | "DECEASED";
export type PigSex = "MALE" | "FEMALE";

/** Error envelope produced by the backend's AllExceptionsFilter. */
export interface ApiErrorBody {
  statusCode: number;
  timestamp: string;
  path: string;
  /** A message, or a list of validation messages for 400 responses. */
  message: string | string[];
}

// ---- auth -----------------------------------------------------------------

/** POST /auth/register */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  /** 8–128 characters. */
  password: string;
  phoneNumber?: string;
}

/** POST /auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/login and POST /auth/refresh */
export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
}

/** GET /auth/me, POST /auth/register, GET /users */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- farms and memberships ------------------------------------------------

/** POST /farms (the caller becomes the farm's ACTIVE OWNER) */
export interface CreateFarmRequest {
  name: string;
  location?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
}

/** GET /farms (farms where the caller has an ACTIVE membership) */
export interface Farm {
  id: string;
  farmCode: string;
  name: string;
  location: string | null;
  address: string | null;
  phoneNumber: string | null;
  email: string | null;
  status: FarmStatus;
  createdAt: string;
  updatedAt: string;
}

/** GET /memberships (own memberships, plus all memberships of farms the caller owns) */
export interface Membership {
  id: string;
  userId: string;
  farmId: string;
  role: Role;
  status: MembershipStatus;
  createdAt: string;
  updatedAt: string;
}

// ---- livestock and devices (farm-scoped) ----------------------------------

/** GET /farms/:farmId/pigs */
export interface Pig {
  id: string;
  farmId: string;
  /** Hardware-supplied identifier, unique within the farm. */
  pigTag: string;
  name: string | null;
  breed: string | null;
  sex: PigSex | null;
  dateOfBirth: string | null;
  /** Kilograms. */
  weight: number | null;
  status: PigStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /farms/:farmId/collars */
export interface Collar {
  id: string;
  gatewayId: string;
  collarCode: string;
  serialNumber: string | null;
  firmwareVersion: string | null;
  hardwareVersion: string | null;
  status: CollarStatus;
  manufacturedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /farms/:farmId/gateways */
export interface Gateway {
  id: string;
  farmId: string;
  /** Hardware-reported, globally unique identifier. */
  gatewayId: string;
  gatewayCode: string;
  serialNumber: string | null;
  firmwareVersion: string | null;
  status: GatewayStatus;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /farms/:farmId/collar-assignments/pig/:pigId/current (OWNER only) */
export interface CollarAssignment {
  id: string;
  collarId: string;
  pigId: string;
  assignedBy: string;
  assignedAt: string;
  removedAt: string | null;
  reason: string | null;
}
