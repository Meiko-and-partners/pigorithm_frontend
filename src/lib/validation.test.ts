import { describe, expect, it } from "vitest";
import { cleanOptional, validateFarm, validateLogin, validateRegister } from "./validation";

const valid = { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", password: "S3curePass!" };

describe("registration validation (mirrors RegisterDto)", () => {
  it("accepts a valid registration", () => {
    expect(validateRegister(valid)).toEqual({});
  });

  it("requires first name, last name and email", () => {
    expect(validateRegister({ ...valid, firstName: " ", lastName: "", email: "" })).toEqual({
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String),
    });
  });

  it("rejects malformed email", () => {
    expect(validateRegister({ ...valid, email: "ada@" }).email).toMatch(/valid email/);
  });

  it("enforces the 8–128 character password length", () => {
    expect(validateRegister({ ...valid, password: "1234567" }).password).toMatch(/at least 8/);
    expect(validateRegister({ ...valid, password: "x".repeat(129) }).password).toMatch(/at most 128/);
    expect(validateRegister({ ...valid, password: "12345678" }).password).toBeUndefined();
  });

  it("treats phone number as optional", () => {
    expect(validateRegister({ ...valid, phoneNumber: "" })).toEqual({});
  });
});

describe("login and farm validation", () => {
  it("requires email and password to sign in", () => {
    expect(validateLogin({ email: "", password: "" })).toEqual({
      email: expect.any(String),
      password: expect.any(String),
    });
  });

  it("requires only the farm name; email must be valid when given", () => {
    expect(validateFarm({ name: "Green Valley" })).toEqual({});
    expect(validateFarm({ name: "" }).name).toBeDefined();
    expect(validateFarm({ name: "A", email: "nope" }).email).toBeDefined();
  });

  it("trims values and drops empty optional fields", () => {
    expect(cleanOptional({ name: " A ", location: " ", email: "" }, ["location", "email"])).toEqual({ name: "A" });
  });
});
