import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";
import { verifyPassword } from "./localAuth";

function adminContext(user: NonNullable<TrpcContext["user"]>): TrpcContext {
  return {
    user: { ...user, role: "admin", isActive: true, mustChangePassword: false },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("administrator user management", () => {
  it("creates a customer, allows a role promotion, and preserves the last active administrator", async () => {
    await db.ensureBootstrapAdmin("abdoemara.175@gmail.com", process.env.LOCAL_ADMIN_BOOTSTRAP_PASSWORD!);
    const owner = await db.getUserByEmail("abdoemara.175@gmail.com");
    expect(owner).toBeTruthy();
    const caller = appRouter.createCaller(adminContext(owner!));
    const email = `operator-${crypto.randomUUID()}@example.test`;

    try {
      const created = await caller.userAdmin.create({ email, name: "Store operator", password: "OperatorPass123", role: "user" });
      expect(created?.role).toBe("user");

      const lastAdminCaller = appRouter.createCaller(adminContext({ ...owner!, id: 999_999 }));
      await expect(lastAdminCaller.userAdmin.setRole({ userId: owner!.id, role: "user" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
      await caller.userAdmin.setRole({ userId: created!.id, role: "admin" });
      expect((await db.getUserById(created!.id))?.role).toBe("admin");
      await caller.userAdmin.setActive({ userId: created!.id, isActive: false });
      expect((await db.getUserById(created!.id))?.isActive).toBe(false);
      await caller.userAdmin.setActive({ userId: created!.id, isActive: true });
      await caller.userAdmin.resetPassword({ userId: created!.id, password: "ReplacementPass456" });
      const resetMember = await db.getUserById(created!.id);
      expect(resetMember?.mustChangePassword).toBe(true);
      expect(await verifyPassword("ReplacementPass456", resetMember?.passwordHash)).toBe(true);
      await caller.userAdmin.delete({ userId: created!.id });
      expect(await db.getUserById(created!.id)).toBeUndefined();
    } finally {
      const created = await db.getUserByEmail(email);
      if (created) await db.deleteUser(created.id);
    }
  }, 20_000);

  it("rejects anonymous and customer calls to user administration", async () => {
    const anonymous: TrpcContext = { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
    await expect(appRouter.createCaller(anonymous).userAdmin.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    const customer: TrpcContext = { user: { id: 2, openId: "customer", email: "customer@example.test", name: "Customer", loginMethod: "local", role: "user", passwordHash: null, mustChangePassword: false, isActive: true, failedLoginCount: 0, lockedUntil: null, passwordUpdatedAt: null, sessionVersion: 0, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
    await expect(appRouter.createCaller(customer).userAdmin.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
