import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  it("returns only the deliberate public identity projection from auth.me", async () => {
    const { ctx } = createAuthContext();
    ctx.user = {
      ...ctx.user!,
      openId: "internal-open-id",
      passwordHash: "scrypt$server-only-password-hash",
      mustChangePassword: true,
      isActive: true,
      failedLoginCount: 4,
      lockedUntil: new Date(),
      passwordUpdatedAt: new Date(),
      sessionVersion: 7,
    };

    const result = await appRouter.createCaller(ctx).auth.me();

    expect(result).toEqual({
      id: 1,
      name: "Sample User",
      email: "sample@example.com",
      loginMethod: "manus",
      role: "user",
      requiresPasswordChange: true,
    });
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("sessionVersion");
    expect(result).not.toHaveProperty("failedLoginCount");
    expect(result).not.toHaveProperty("lockedUntil");
    expect(result).not.toHaveProperty("mustChangePassword");
    expect(result).not.toHaveProperty("openId");
  });

  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});
