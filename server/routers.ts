import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { commerceRouter } from "./routers/commerce";
import { adminRouter } from "./routers/admin";
import { searchRouter } from "./routers/search";
import { localAuthRouter } from "./routers/localAuth";
import { userAdminRouter } from "./routers/userAdmin";
import { toPublicAuthUser } from "./publicUser";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user ? toPublicAuthUser(opts.ctx.user) : null),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      if (ctx.user) await db.incrementSessionVersion(ctx.user.id);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  commerce: commerceRouter,
  admin: adminRouter,
  localAuth: localAuthRouter,
  userAdmin: userAdminRouter,
  search: searchRouter,
});

export type AppRouter = typeof appRouter;
