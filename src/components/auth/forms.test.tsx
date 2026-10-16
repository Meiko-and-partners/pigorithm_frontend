import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";

const auth = {
  login: vi.fn(),
  register: vi.fn(),
  createFarm: vi.fn(),
  logout: vi.fn(),
  state: { status: "authenticated", user: { firstName: "Ada" } },
};
let params = new URLSearchParams();

vi.mock("@/lib/auth/AuthProvider", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/AuthProvider")>()),
  useAuth: () => auth,
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => params }));

const { LoginForm } = await import("./LoginForm");
const { RegisterForm } = await import("./RegisterForm");
const { FarmSetupForm } = await import("./FarmSetupForm");
const { SignInAfterRegisterError } = await import("@/lib/auth/AuthProvider");

const type = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("auth forms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    params = new URLSearchParams();
  });
  afterEach(cleanup);

  describe("login", () => {
    it("signs in with trimmed email and the exact password", async () => {
      auth.login.mockResolvedValueOnce({});
      render(<LoginForm />);
      type(/^email/i, "  owner@example.com ");
      type(/^password/i, " pw with spaces ");
      fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

      await waitFor(() =>
        expect(auth.login).toHaveBeenCalledWith({ email: "owner@example.com", password: " pw with spaces " }),
      );
      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("shows a friendly message for invalid credentials", async () => {
      auth.login.mockRejectedValueOnce(new ApiError("unauthorized", 401, ["Invalid credentials"]));
      render(<LoginForm />);
      type(/^email/i, "owner@example.com");
      type(/^password/i, "wrong");
      fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

      expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Email or password is incorrect.");
      expect(screen.getByRole("button", { name: "Sign in" })).toHaveProperty("disabled", false);
    });

    it("shows a network failure clearly", async () => {
      auth.login.mockRejectedValueOnce(new ApiError("network", 0, []));
      render(<LoginForm />);
      type(/^email/i, "owner@example.com");
      type(/^password/i, "pw");
      fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
      expect((await screen.findByRole("alert")).textContent).toMatch(/Can't reach the Pigorithm API/);
    });

    it("validates before calling the API", async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
      expect(await screen.findByText("Enter your email address.")).toBeTruthy();
      expect(auth.login).not.toHaveBeenCalled();
    });

    it("explains an expired session", () => {
      params = new URLSearchParams("expired=1");
      render(<LoginForm />);
      expect(screen.getByRole("status").textContent).toMatch(/session ended/);
    });
  });

  describe("registration", () => {
    it("shows field errors and does not call the API for invalid input", async () => {
      render(<RegisterForm />);
      type(/^email/i, "not-an-email");
      type(/^password/i, "short");
      fireEvent.click(screen.getByRole("button", { name: "Create account" }));

      expect(await screen.findByText("Enter your first name.")).toBeTruthy();
      expect(screen.getByText("Enter a valid email address.")).toBeTruthy();
      expect(screen.getByText("Use at least 8 characters.")).toBeTruthy();
      expect(auth.register).not.toHaveBeenCalled();
    });

    it("registers with the backend's fields, omitting an empty phone number", async () => {
      auth.register.mockResolvedValueOnce({});
      render(<RegisterForm />);
      type(/^first name/i, " Ada ");
      type(/^last name/i, "Lovelace");
      type(/^email/i, "ada@example.com");
      type(/^password/i, "S3curePass!");
      fireEvent.click(screen.getByRole("button", { name: "Create account" }));

      await waitFor(() =>
        expect(auth.register).toHaveBeenCalledWith({
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
          password: "S3curePass!",
        }),
      );
    });

    it("explains a duplicate email", async () => {
      auth.register.mockRejectedValueOnce(new ApiError("conflict", 409, ["A record with this email already exists"]));
      render(<RegisterForm />);
      type(/^first name/i, "Ada");
      type(/^last name/i, "Lovelace");
      type(/^email/i, "ada@example.com");
      type(/^password/i, "S3curePass!");
      fireEvent.click(screen.getByRole("button", { name: "Create account" }));
      expect((await screen.findByRole("alert")).textContent).toMatch(/already exists/);
    });

    it("tells the user their account exists when the automatic sign-in fails", async () => {
      auth.register.mockRejectedValueOnce(new SignInAfterRegisterError(new ApiError("network", 0, [])));
      render(<RegisterForm />);
      type(/^first name/i, "Ada");
      type(/^last name/i, "Lovelace");
      type(/^email/i, "ada@example.com");
      type(/^password/i, "S3curePass!");
      fireEvent.click(screen.getByRole("button", { name: "Create account" }));
      expect((await screen.findByRole("status")).textContent).toMatch(/account was created/);
    });
  });

  describe("farm onboarding", () => {
    it("creates the farm with only the fields provided", async () => {
      auth.createFarm.mockResolvedValueOnce({ id: "f1" });
      render(<FarmSetupForm />);
      type(/^farm name/i, " Green Valley ");
      type(/^location/i, "Ibadan");
      fireEvent.click(screen.getByRole("button", { name: "Create farm" }));

      await waitFor(() => expect(auth.createFarm).toHaveBeenCalledWith({ name: "Green Valley", location: "Ibadan" }));
    });

    it("requires a farm name", async () => {
      render(<FarmSetupForm />);
      fireEvent.click(screen.getByRole("button", { name: "Create farm" }));
      expect(await screen.findByText("Enter your farm's name.")).toBeTruthy();
      expect(auth.createFarm).not.toHaveBeenCalled();
    });

    it("shows backend validation messages", async () => {
      auth.createFarm.mockRejectedValueOnce(new ApiError("validation", 400, ["email must be an email"]));
      render(<FarmSetupForm />);
      type(/^farm name/i, "Green Valley");
      fireEvent.click(screen.getByRole("button", { name: "Create farm" }));
      expect((await screen.findByRole("alert")).textContent).toBe("email must be an email");
    });
  });
});
