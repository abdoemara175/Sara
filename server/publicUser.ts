import type { User } from "../drizzle/schema";

/**
 * Deliberately small identity projection for browser-facing authentication APIs.
 * Database user rows contain credential and session-control fields that must
 * remain available only to server-side authorization logic.
 */
export type PublicAuthUser = Pick<
  User,
  "id" | "name" | "email" | "loginMethod" | "role"
> & {
  requiresPasswordChange: boolean;
};

export function toPublicAuthUser(user: User): PublicAuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    role: user.role,
    requiresPasswordChange: user.mustChangePassword,
  };
}
