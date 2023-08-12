import { DataFunctionArgs } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { getAuthenticator } from "~/services/auth.server";

export async function action({ request, context }: DataFunctionArgs) {
  const authenticator = await getAuthenticator(context);
  return await authenticator.authenticate("user-pass", request, {
    successRedirect: "/success",
    failureRedirect: "/login",
  });
}

export async function loader({ request, context }: DataFunctionArgs) {
  const authenticator = await getAuthenticator(context);
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/success",
  });
}

export default function Login() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Form method="post">
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          style={{ display: "block", marginBottom: "1rem" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          style={{ display: "block", marginBottom: "1rem" }}
        />
        <button type="submit">Sign In</button>
      </Form>
    </div>
  );
}
