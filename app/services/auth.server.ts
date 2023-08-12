import {
  createWorkersKVSessionStorage,
  createCookie,
  AppLoadContext,
  SessionStorage,
  SessionData,
} from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";

interface Env {
  SESSION_SECRET: string;
  SESSION_KV: KVNamespace;
}

export type User = {
  id: string;
};

let _authenticator: Authenticator<User> | undefined;
let _sessionStorage: SessionStorage<SessionData, SessionData> | undefined;

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
        // TODO: implement own authentication logic here
        let email = form.get("email");
        let password = form.get("password");
        let user = { id: "12345678" };
        return user;
      }),
      "user-pass"
    );
  }

  return _authenticator;
}
