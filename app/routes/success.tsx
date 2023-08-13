import { DataFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/services/auth.server";

export async function loader({ request, context }: DataFunctionArgs) {
  const authenticator = await getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  return json({ user });
}

export default function Success() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Success to sign in</h1>
      <p>
        Hi, {user.id}:{user.email}
      </p>
      <Form action="/logout" method="post">
        <button type="submit">Sign Out</button>
      </Form>
    </div>
  );
}
