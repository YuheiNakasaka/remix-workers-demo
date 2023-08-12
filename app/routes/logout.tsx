import { DataFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/services/auth.server";

export async function action({ request, context }: DataFunctionArgs) {
  const authenticator = await getAuthenticator(context);
  return await authenticator.logout(request, { redirectTo: "/" });
}

export async function loader() {
  return redirect("/");
}
