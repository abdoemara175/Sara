import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, User, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { hashPassword, normalizeEmail } from "./localAuth";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function requireDb(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) throw new Error("Database is unavailable");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] === undefined) continue;
    const value = user[field] ?? null;
    values[field] = value;
    updateSet[field] = value;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, normalizeEmail(email))).limit(1);
  return result[0];
}

export async function ensureBootstrapAdmin(email: string, initialPassword: string) {
  const db = requireDb(await getDb());
  const normalizedEmail = normalizeEmail(email);
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    await db.update(users).set({
      ...(existing.passwordHash ? {} : {
        passwordHash: await hashPassword(initialPassword),
        mustChangePassword: true,
        passwordUpdatedAt: new Date(),
      }),
      isActive: true,
      role: "admin",
      loginMethod: existing.loginMethod || "local",
    }).where(eq(users.id, existing.id));
    return getUserByEmail(normalizedEmail);
  }
  await db.insert(users).values({
    openId: `local:${crypto.randomUUID()}`,
    name: "Store Administrator",
    email: normalizedEmail,
    loginMethod: "local",
    role: "admin",
    passwordHash: await hashPassword(initialPassword),
    mustChangePassword: true,
    isActive: true,
    passwordUpdatedAt: new Date(),
    lastSignedIn: new Date(),
  });
  return getUserByEmail(normalizedEmail);
}

export async function recordFailedLocalLogin(user: User) {
  const db = requireDb(await getDb());
  const failures = user.failedLoginCount + 1;
  const lockedUntil = failures >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
  await db.update(users).set({ failedLoginCount: failures, lockedUntil }).where(eq(users.id, user.id));
}

export async function recordSuccessfulLocalLogin(userId: number) {
  const db = requireDb(await getDb());
  await db.update(users).set({ failedLoginCount: 0, lockedUntil: null, lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function updateLocalPassword(userId: number, passwordHash: string, mustChangePassword = false) {
  const db = requireDb(await getDb());
  await db.update(users).set({ passwordHash, mustChangePassword, passwordUpdatedAt: new Date(), failedLoginCount: 0, lockedUntil: null }).where(eq(users.id, userId));
}

export async function incrementSessionVersion(userId: number) {
  const db = requireDb(await getDb());
  await db.update(users).set({ sessionVersion: sql`${users.sessionVersion} + 1` }).where(eq(users.id, userId));
}

export async function listUsersForAdmin() {
  const db = requireDb(await getDb());
  return db.select({
    id: users.id, name: users.name, email: users.email, role: users.role, loginMethod: users.loginMethod,
    isActive: users.isActive, mustChangePassword: users.mustChangePassword, createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(users.createdAt);
}

export async function createLocalUser(input: { email: string; name?: string; password: string; role: "admin" | "user" }) {
  const db = requireDb(await getDb());
  const email = normalizeEmail(input.email);
  if (await getUserByEmail(email)) throw new Error("An account with this email already exists");
  await db.insert(users).values({
    openId: `local:${crypto.randomUUID()}`,
    name: input.name?.trim() || null,
    email,
    loginMethod: "local",
    role: input.role,
    passwordHash: await hashPassword(input.password),
    mustChangePassword: true,
    isActive: true,
    passwordUpdatedAt: new Date(),
    lastSignedIn: new Date(),
  });
  return getUserByEmail(email);
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function countActiveAdmins() {
  const db = requireDb(await getDb());
  const result = await db.select({ count: sql<number>`count(*)` }).from(users).where(and(eq(users.role, "admin"), eq(users.isActive, true)));
  return Number(result[0]?.count ?? 0);
}

export async function setUserRole(userId: number, role: "admin" | "user") {
  const db = requireDb(await getDb());
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function setUserActive(userId: number, isActive: boolean) {
  const db = requireDb(await getDb());
  await db.update(users).set({ isActive }).where(eq(users.id, userId));
}

export async function deleteUser(userId: number) {
  const db = requireDb(await getDb());
  await db.delete(users).where(eq(users.id, userId));
}
