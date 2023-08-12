import { DataFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/services/auth.server";

export async function loader({ request, context }: DataFunctionArgs) {
  const authenticator = await getAuthenticator(context);
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/success",
  });
}

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix!</h1>
      <a href="/login">Login</a>
    </div>
  );
}
