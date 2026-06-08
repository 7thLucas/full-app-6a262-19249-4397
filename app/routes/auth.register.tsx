import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  getUserFromRequest,
  signJwt,
  buildAuthCookie,
} from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";
import { RegisterCard } from "~/modules/authentication";

export async function loader({ request }: LoaderFunctionArgs) {
  if (getUserFromRequest(request)) return redirect("/dashboard");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    const user = await AuthService.register({
      username: String(formData.get("username") ?? ""),
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
    const message = error instanceof Error ? error.message : "Registration failed";
    return { error: message };
  }
}

export default function RegisterRoute() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">InterviewLens</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create your free account</p>
        </div>
        <RegisterCard />
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <a href="/auth/login" className="text-accent font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
