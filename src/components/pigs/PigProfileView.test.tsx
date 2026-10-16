import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import type { Role } from "@/lib/api/types";

let role: Role | null = "OWNER";
const backend = {
  getPig: vi.fn(),
  listCollars: vi.fn(),
  currentCollarForPig: vi.fn(),
};
vi.mock("@/lib/api/backend", () => ({ backend }));
vi.mock("@/lib/auth/AuthProvider", () => ({
  useFarmContext: () => ({ farm: { id: "f1", name: "Green Valley" }, role }),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const { PigProfileView } = await import("./PigProfileView");

const pig = {
  id: "p1",
  farmId: "f1",
  pigTag: "PG-1001",
  name: "Rosie",
  breed: "Duroc",
  sex: "FEMALE",
  dateOfBirth: null,
  weight: 81.2,
  status: "ACTIVE",
  notes: null,
  createdAt: "2026-10-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
};
const collar = { id: "c1", gatewayId: "g1", collarCode: "DEMO-C001", status: "ACTIVE", firmwareVersion: "2.4.1" };

describe("pig profile (role-based UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backend.getPig.mockResolvedValue(pig);
    backend.listCollars.mockResolvedValue([collar]);
    backend.currentCollarForPig.mockRejectedValue(new ApiError("not_found", 404, ["No active collar"]));
    role = "OWNER";
  });
  afterEach(cleanup);

  it("shows the real pig record", async () => {
    render(<PigProfileView pigId="p1" />);
    expect(await screen.findByRole("heading", { name: "PG-1001" })).toBeTruthy();
    expect(screen.getByText(/Rosie · Duroc · Female/)).toBeTruthy();
    expect(screen.getByText("81.2")).toBeTruthy();
  });

  it("shows the assigned collar to the farm owner", async () => {
    role = "OWNER";
    backend.currentCollarForPig.mockResolvedValue({ id: "a1", collarId: "c1", pigId: "p1", assignedAt: "2026-10-02T00:00:00Z" });
    render(<PigProfileView pigId="p1" />);
    expect(await screen.findByText("Collar DEMO-C001")).toBeTruthy();
  });

  it("does not request collar assignments for workers or vets", async () => {
    role = "WORKER";
    render(<PigProfileView pigId="p1" />);
    expect(await screen.findByText("Owner only")).toBeTruthy();
    expect(backend.currentCollarForPig).not.toHaveBeenCalled();
  });

  it("shows a missing pig as not found", async () => {
    backend.getPig.mockRejectedValueOnce(new ApiError("not_found", 404, ["Pig not found"]));
    render(<PigProfileView pigId="p1" />);
    expect(await screen.findByText("Pig not found")).toBeTruthy();
  });

  it("shows other failures with a retry", async () => {
    backend.getPig.mockRejectedValueOnce(new ApiError("server", 500, []));
    render(<PigProfileView pigId="p1" />);
    expect(await screen.findByRole("button", { name: /try again/i })).toBeTruthy();
  });
});
