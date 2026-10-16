import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const session = {
  hasSessionHint: vi.fn(() => true),
  refreshAccessToken: vi.fn(async () => "token" as string | null),
  login: vi.fn(async () => {}),
  logout: vi.fn(async () => {}),
  api: {},
  SESSION_EXPIRED_EVENT: "pigorithm:session-expired",
};
const backend = {
  me: vi.fn(),
  listFarms: vi.fn(),
  listMemberships: vi.fn(),
  register: vi.fn(),
  createFarm: vi.fn(),
};
vi.mock("./session", () => session);
vi.mock("@/lib/api/endpoints", () => ({ endpoints: () => backend }));

const { AuthProvider, useAuth } = await import("./AuthProvider");

const user = { id: "u1", firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" };
const farm = { id: "f1", name: "Green Valley", farmCode: "FARM-1" };

const probe: { auth?: ReturnType<typeof useAuth> } = {};
function Probe() {
  const auth = useAuth();
  useEffect(() => {
    probe.auth = auth;
  });
  const s = auth.state;
  return (
    <div data-testid="state">
      {s.status}
      {s.status === "authenticated" ? `:${s.farms.length}:${s.farmId}` : ""}
      {s.status === "unauthenticated" && s.expired ? ":expired" : ""}
    </div>
  );
}

const renderProvider = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
const stateText = () => screen.getByTestId("state").textContent;

describe("AuthProvider (authentication state)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    session.hasSessionHint.mockReturnValue(true);
    session.refreshAccessToken.mockResolvedValue("token");
    backend.me.mockResolvedValue(user);
    backend.listFarms.mockResolvedValue([farm]);
    backend.listMemberships.mockResolvedValue([]);
    window.localStorage.clear();
  });
  afterEach(cleanup);

  it("is signed out without a session cookie, without calling the API", async () => {
    session.hasSessionHint.mockReturnValue(false);
    renderProvider();
    await waitFor(() => expect(stateText()).toBe("unauthenticated"));
    expect(session.refreshAccessToken).not.toHaveBeenCalled();
  });

  it("restores a session from the refresh cookie and loads the account", async () => {
    renderProvider();
    await waitFor(() => expect(stateText()).toBe("authenticated:1:f1"));
  });

  it("is signed out when the refresh is rejected", async () => {
    session.refreshAccessToken.mockResolvedValue(null);
    renderProvider();
    await waitFor(() => expect(stateText()).toBe("unauthenticated"));
  });

  it("reports an error (not a sign-out) when the API is unreachable", async () => {
    session.refreshAccessToken.mockRejectedValue(new Error("down"));
    renderProvider();
    await waitFor(() => expect(stateText()).toBe("error"));
  });

  it("signs the user out when any request finds the session expired", async () => {
    renderProvider();
    await waitFor(() => expect(stateText()).toBe("authenticated:1:f1"));
    act(() => window.dispatchEvent(new Event("pigorithm:session-expired")));
    expect(stateText()).toBe("unauthenticated:expired");
  });

  it("registers, signs in, then onboards the first farm", async () => {
    session.hasSessionHint.mockReturnValue(false);
    backend.listFarms.mockResolvedValueOnce([]); // right after registration
    renderProvider();
    await waitFor(() => expect(stateText()).toBe("unauthenticated"));

    await act(() =>
      probe.auth!.register({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", password: "S3curePass!" }),
    );
    expect(session.login).toHaveBeenCalledWith({ email: "ada@example.com", password: "S3curePass!" });
    expect(stateText()).toBe("authenticated:0:null");

    backend.createFarm.mockResolvedValueOnce(farm);
    await act(() => probe.auth!.createFarm({ name: "Green Valley" }));
    expect(backend.createFarm).toHaveBeenCalledWith({ name: "Green Valley" });
    expect(stateText()).toBe("authenticated:1:f1");
  });

  it("logs out through the session module", async () => {
    renderProvider();
    await waitFor(() => expect(stateText()).toBe("authenticated:1:f1"));
    await act(() => probe.auth!.logout());
    expect(session.logout).toHaveBeenCalled();
    expect(stateText()).toBe("unauthenticated");
  });
});
