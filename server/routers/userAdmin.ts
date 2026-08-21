import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { hashPassword, validateNewPassword } from "../localAuth";

const roleSchema = z.enum(["admin", "user"]);

async function assertAdminCanChangeTarget(actorId: number, targetId: number, action: "demote" | "disable" | "delete") {
  const target = await db.getUserById(targetId);
  if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  if (actorId === targetId && action !== "delete") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Administrators cannot remove their own active access." });
  }
  if (target.role === "admin" && target.isActive && await db.countActiveAdmins() <= 1) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "At least one active administrator must remain." });
  }
  return target;
}

export const userAdminRouter = router({
  list: adminProcedure.query(() => db.listUsersForAdmin()),

  create: adminProcedure.input(z.object({
    email: z.string().email().max(320),
    name: z.string().trim().max(120).optional(),
    password: z.string().min(1).max(256),
    role: roleSchema,
  })).mutation(async ({ input }) => {
    const validationError = validateNewPassword(input.password);
    if (validationError) throw new TRPCError({ code: "BAD_REQUEST", message: validationError });
    try {
      const user = await db.createLocalUser(input);
      return user && { id: user.id, email: user.email, role: user.role };
    } catch (error) {
      throw new TRPCError({ code: "CONFLICT", message: error instanceof Error ? error.message : "Unable to create user" });
    }
  }),

  setRole: adminProcedure.input(z.object({ userId: z.number().int().positive(), role: roleSchema })).mutation(async ({ ctx, input }) => {
    const target = await db.getUserById(input.userId);
    if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    if (target.role === "admin" && input.role !== "admin") await assertAdminCanChangeTarget(ctx.user.id, input.userId, "demote");
    await db.setUserRole(input.userId, input.role);
    return { success: true } as const;
  }),

  setActive: adminProcedure.input(z.object({ userId: z.number().int().positive(), isActive: z.boolean() })).mutation(async ({ ctx, input }) => {
    const target = await db.getUserById(input.userId);
    if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    if (target.role === "admin" && target.isActive && !input.isActive) await assertAdminCanChangeTarget(ctx.user.id, input.userId, "disable");
    await db.setUserActive(input.userId, input.isActive);
    return { success: true } as const;
  }),

  resetPassword: adminProcedure.input(z.object({ userId: z.number().int().positive(), password: z.string().min(1).max(256) })).mutation(async ({ input }) => {
    const validationError = validateNewPassword(input.password);
    if (validationError) throw new TRPCError({ code: "BAD_REQUEST", message: validationError });
    const target = await db.getUserById(input.userId);
    if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    await db.updateLocalPassword(input.userId, await hashPassword(input.password), true);
    return { success: true } as const;
  }),

  delete: adminProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    await assertAdminCanChangeTarget(ctx.user.id, input.userId, "delete");
    await db.deleteUser(input.userId);
    return { success: true } as const;
  }),
});
