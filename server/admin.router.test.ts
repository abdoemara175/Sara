import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import { describe, expect, it, vi } from "vitest";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeCtx(user: AuthenticatedUser | null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const customer: AuthenticatedUser = {
  id: 7,
  openId: "customer-user",
  name: "Customer",
  email: "customer@example.com",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("admin access boundaries", () => {
  it("rejects anonymous access before any administration data is returned", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.admin.overview()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects customer access before any administration data is returned", async () => {
    const caller = appRouter.createCaller(makeCtx(customer));
    await expect(caller.admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
