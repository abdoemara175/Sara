import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import * as db from "./db";
import { hashPassword } from "./localAuth";
import { sdk } from "./_core/sdk";
import { COOKIE_NAME } from "../shared/const";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeContext(user: AuthenticatedUser | null): TrpcContext & { cookies: unknown[][] } {
  const cookies: unknown[][] = [];
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: (...args: unknown[]) => cookies.push(args),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
    cookies,
  };
}

function contextualUser(overrides: Partial<AuthenticatedUser>): AuthenticatedUser {
  return {
    id: 700,
    openId: "flow-matrix-user",
    name: "Flow Matrix User",
    email: "flow-matrix@example.test",
    loginMethod: "local",
    role: "user",
    passwordHash: null,
    mustChangePassword: false,
    isActive: true,
    failedLoginCount: 0,
    lockedUntil: null,
    passwordUpdatedAt: null,
    sessionVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

describe("user-flow permission matrix", () => {
  it("blocks anonymous customers and temporary-password administrators before admin data is read", async () => {
    await expect(appRouter.createCaller(makeContext(null)).admin.overview()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(appRouter.createCaller(makeContext(contextualUser({ role: "user" }))).admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(makeContext(contextualUser({ role: "admin", mustChangePassword: true }))).admin.overview()).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Change the temporary password before accessing administration.",
    });
  });

  it("rejects an existing local session as soon as its account is disabled", async () => {
    const email = `disabled-flow-${crypto.randomUUID()}@example.test`;
    const password = "DisabledFlowPass123";
    try {
      const created = await db.createLocalUser({ email, password, role: "user" });
      await db.updateLocalPassword(created!.id, await hashPassword(password), false);
      const signInContext = makeContext(null);
      await appRouter.createCaller(signInContext).localAuth.signIn({ email, password });
      const [, token] = signInContext.cookies[0] as [string, string];
      const request = { headers: { cookie: `${COOKIE_NAME}=${token}` } } as Parameters<typeof sdk.authenticateRequest>[0];
      await expect(sdk.authenticateRequest(request)).resolves.toMatchObject({ email, isActive: true });

      await db.setUserActive(created!.id, false);
      await expect(sdk.authenticateRequest(request)).rejects.toThrow("User account is disabled");
    } finally {
      const stored = await db.getUserByEmail(email);
      if (stored) await db.deleteUser(stored.id);
    }
  }, 20_000);
});
