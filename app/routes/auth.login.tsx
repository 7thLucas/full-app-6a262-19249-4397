import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  getUserFromRequest,
  signJwt,
  buildAuthCookie,
} from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";
import { LoginCard } from "~/modules/authentication";

export async function loader({ request }: LoaderFunctionArgs) {
  if (getUserFromRequest(request)) return redirect("/dashboard");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    const user = await AuthService.login({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    const token = signJwt({
      sub: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
      email_verified: user.email_verified ?? false,
    });
    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": buildAuthCookie(token, new URL(request.url).hostname),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid credentials";
    return { error: message };
  }
}

export default function LoginRoute() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">InterviewLens</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sign in to your account</p>
        </div>
        <LoginCard />
        <p className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account?{" "}
          <a href="/auth/register" className="text-accent font-medium hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
