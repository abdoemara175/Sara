import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import { hashPassword, verifyPassword } from "./localAuth";
import type { TrpcContext } from "./_core/context";
import { COOKIE_NAME } from "../shared/const";
import { sdk } from "./_core/sdk";

function makeContext(user: TrpcContext["user"] = null): TrpcContext & { cookies: unknown[]; cleared: unknown[] } {
  const cookies: unknown[] = [];
  const cleared: unknown[] = [];
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: (...args: unknown[]) => cookies.push(args),
      clearCookie: (...args: unknown[]) => cleared.push(args),
    } as TrpcContext["res"],
    cookies,
    cleared,
  };
}

describe("local administrator authentication", () => {
  it("provisions a bootstrap administrator with a hash without touching the operational account", async () => {
    const email = `bootstrap-${crypto.randomUUID()}@example.test`;
    const initialPassword = "BootstrapPass123";
    try {
      const stored = await db.ensureBootstrapAdmin(email, initialPassword);
      expect(stored?.role).toBe("admin");
      expect(stored?.isActive).toBe(true);
      expect(stored?.passwordHash).toBeTruthy();
      expect(stored?.passwordHash).not.toBe(initialPassword);
      expect(await verifyPassword(initialPassword, stored?.passwordHash)).toBe(true);
    } finally {
      const stored = await db.getUserByEmail(email);
      if (stored) await db.deleteUser(stored.id);
    }
  }, 15_000);

  it("rejects an incorrect password without exposing password material", async () => {
    const email = `rejection-${crypto.randomUUID()}@example.test`;
    try {
      await db.createLocalUser({ email, password: "CustomerPass123", role: "user" });
      const ctx = makeContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.localAuth.signIn({ email, password: "incorrect-password" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(ctx.cookies).toHaveLength(0);
    } finally {
      const stored = await db.getUserByEmail(email);
      if (stored) await db.deleteUser(stored.id);
    }
  });

  it("uses a memory-hard password hash format", async () => {
    const encoded = await hashPassword("ExamplePass123");
    expect(encoded.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("ExamplePass123", encoded)).toBe(true);
    expect(await verifyPassword("different-password", encoded)).toBe(false);
  });

  it("accepts the issued local session before sign-out then rejects that exact token after server-side revocation", async () => {
    const email = `session-admin-${crypto.randomUUID()}@example.test`;
    const password = "SessionAdminPass123";
    try {
      const created = await db.createLocalUser({ email, password, role: "admin" });
      await db.updateLocalPassword(created!.id, await hashPassword(password), false);
      const signInContext = makeContext();
      await appRouter.createCaller(signInContext).localAuth.signIn({ email, password });
      expect(signInContext.cookies).toHaveLength(1);
      const [cookieName, token] = signInContext.cookies[0] as [string, string];
      expect(cookieName).toBe(COOKIE_NAME);
      const request = { headers: { cookie: `${COOKIE_NAME}=${token}` } } as Parameters<typeof sdk.authenticateRequest>[0];
      const authenticatedUser = await sdk.authenticateRequest(request);
      await expect(appRouter.createCaller(makeContext(authenticatedUser)).userAdmin.list()).resolves.toEqual(expect.any(Array));

      const signOutContext = makeContext(authenticatedUser);
      await appRouter.createCaller(signOutContext).auth.logout();
      expect(signOutContext.cleared).toHaveLength(1);
      expect((signOutContext.cleared[0] as unknown[])[0]).toBe(COOKIE_NAME);
      await expect(sdk.authenticateRequest(request)).rejects.toThrow();
    } finally {
      const stored = await db.getUserByEmail(email);
      if (stored) await db.deleteUser(stored.id);
    }
  }, 20_000);
});
