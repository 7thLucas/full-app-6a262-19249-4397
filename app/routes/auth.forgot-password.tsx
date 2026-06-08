import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";
import { ForgotPasswordCard } from "~/modules/authentication";

export async function loader({ request }: LoaderFunctionArgs) {
  if (getUserFromRequest(request)) return redirect("/dashboard");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    await AuthService.forgotPassword(String(formData.get("email") ?? ""));
  } catch {
    // Swallow error to prevent email enumeration
  }
  return {
    success: true,
    message: "If that email exists, a reset link has been sent. Check your inbox.",
  };
}

export default function ForgotPasswordRoute() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">InterviewLens</h1>
          <p className="text-muted-foreground mt-1 text-sm">Reset your password</p>
        </div>
        <ForgotPasswordCard />
        <p className="text-center text-sm text-muted-foreground mt-4">
          <a href="/auth/login" className="text-accent font-medium hover:underline">
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  );
}
