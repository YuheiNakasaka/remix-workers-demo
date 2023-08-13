import {
  createWorkersKVSessionStorage,
  createCookie,
  AppLoadContext,
  SessionStorage,
  SessionData,
} from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { createClient } from "./db.server";
import { users } from "db/schema";
import { InferModel, eq } from "drizzle-orm";

interface Env {
  SESSION_SECRET: string;
  SESSION_KV: KVNamespace;
  DB: D1Database;
}

export type User = {
  id: number;
  email: string;
};

let _authenticator: Authenticator<User> | undefined;
let _sessionStorage: SessionStorage<SessionData, SessionData> | undefined;

type NewUser = InferModel<typeof users, "insert">;

export async function getAuthenticator(
  context: AppLoadContext
): Promise<Authenticator<User>> {
  if (!_authenticator) {
    const env = context.env as Env;
    const cookie = createCookie("__session", {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      secrets: [env.SESSION_SECRET],
    });
    _sessionStorage = createWorkersKVSessionStorage({
      kv: env.SESSION_KV,
      cookie,
    });
    _authenticator = new Authenticator<User>(_sessionStorage);
    _authenticator.use(
      new FormStrategy(async ({ form }) => {
        const email = form.get("email") as string;
        const password = form.get("password") as string;
        const hashedPassword = await getDigestString(
          password,
          env.SESSION_SECRET
        );
        const db = createClient(env.DB);
        let user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .where(eq(users.password, hashedPassword))
          .get();

        if (!user) {
          const newUser: NewUser = {
            email: email as string,
            password: hashedPassword,
          };
          user = await db.insert(users).values(newUser).returning().get();
        }
        return user;
      }),
      "user-pass"
    );
  }

  return _authenticator;
}

async function getDigestString(str: string, salt?: string) {
  const buffer = await crypto.subtle.digest(
    {
      name: "SHA-256",
    },
    new TextEncoder().encode(`${salt}${str}`)
  );
  const hashArray = Array.from(new Uint8Array(buffer));
  const hashedText = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashedText;
}
