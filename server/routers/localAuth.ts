import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { sdk } from "../_core/sdk";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { hashPassword, normalizeEmail, validateNewPassword, verifyPassword } from "../localAuth";
import { toPublicAuthUser } from "../publicUser";

const credentialsSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(256),
});

export const localAuthRouter = router({
  signIn: publicProcedure.input(credentialsSchema).mutation(async ({ ctx, input }) => {
    const bootstrapPassword = ENV.localAdminBootstrapPassword;
    if (bootstrapPassword) {
      await db.ensureBootstrapAdmin("abdoemara.175@gmail.com", bootstrapPassword);
    }
    const user = await db.getUserByEmail(normalizeEmail(input.email));
    const invalidCredentials = () => new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    if (!user || !user.isActive) throw invalidCredentials();
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "This account is temporarily locked. Try again later." });
    }
    if (!await verifyPassword(input.password, user.passwordHash)) {
      await db.recordFailedLocalLogin(user);
      throw invalidCredentials();
    }
    await db.recordSuccessfulLocalLogin(user.id);
    const token = await sdk.createSessionToken(user.openId, { expiresInMs: 12 * 60 * 60 * 1000, name: user.name || user.email || "Store user", sessionVersion: user.sessionVersion });
    ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 12 * 60 * 60 * 1000 });
    return { user: toPublicAuthUser(user) };
  }),

  changePassword: protectedProcedure.input(z.object({
    currentPassword: z.string().min(1).max(256),
    newPassword: z.string().min(1).max(256),
  })).mutation(async ({ ctx, input }) => {
    const user = await db.getUserById(ctx.user.id);
    if (!user || !user.isActive || !await verifyPassword(input.currentPassword, user.passwordHash)) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect" });
    }
    const validationError = validateNewPassword(input.newPassword);
    if (validationError) throw new TRPCError({ code: "BAD_REQUEST", message: validationError });
    await db.updateLocalPassword(user.id, await hashPassword(input.newPassword));
    return { success: true } as const;
  }),
});
