import type { LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppLayout, PageHeader } from "~/components/app-layout";
import {
  CheckCircle2,
  Mic2,
  Clock,
  Calendar,
  MessageSquare,
  BarChart2,
  AlertCircle,
} from "lucide-react";

// Server-side import of service — only runs in loader
import { AnalysisSessionService } from "~/modules/audio-analyzer/src/services/analysis-session.service";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const id = params.id ?? "";

  let session: Awaited<ReturnType<typeof AnalysisSessionService.getSessionById>> = null;
  try {
    session = await AnalysisSessionService.getSessionById(id, user.id);
  } catch {
    // Invalid ObjectId format — redirect to dashboard
    return redirect("/dashboard");
  }

  if (!session) return redirect("/dashboard");

  return { session, user };
}

type SessionData = {
  _id: string;
  filename: string;
  candidateName?: string;
  overallScore?: number;
  categoryScores?: Record<string, number>;
  summary?: string;
  status: string;
  durationMs?: number;
  createdAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(durationMs: number | undefined): string {
  if (durationMs === undefined) return "—";
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color =
    value >= 85 ? "text-emerald-600" : value >= 70 ? "text-amber-600" : "text-red-500";
  const bg =
    value >= 85
      ? "bg-emerald-50 border-emerald-200"
      : value >= 70
      ? "bg-amber-50 border-amber-200"
      : "bg-red-50 border-red-200";
  return (
    <div className={`rounded-lg border p-4 ${bg}`}>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      <div className="mt-2 h-1 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            value >= 85 ? "bg-emerald-500" : value >= 70 ? "bg-amber-500" : "bg-red-400"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function titleFromId(id: string): string {
  return id
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function SessionDetailPage() {
  const { session } = useLoaderData<typeof loader>() as { session: SessionData };

  const categoryScores = session.categoryScores
    ? Object.entries(session.categoryScores)
    : [];

  return (
    <AppLayout>
      <PageHeader
        title={session.candidateName ?? session.filename}
        subtitle={`Analyzed on ${formatDate(session.createdAt)}`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "History", href: "/analysis-history" },
          { label: session.candidateName ?? session.filename },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatDuration(session.durationMs)}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(session.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Mic2 className="w-4 h-4" />
            {session.filename}
          </span>
          {session.status === "completed" ? (
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Analysis complete
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-red-500 font-medium">
              <AlertCircle className="w-4 h-4" />
              Analysis {session.status}
            </span>
          )}
        </div>

        {/* Scores */}
        {(session.overallScore !== undefined || categoryScores.length > 0) && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Scores
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {session.overallScore !== undefined && (
                <ScoreCard label="Overall" value={session.overallScore} />
              )}
              {categoryScores.map(([catId, score]) => (
                <ScoreCard key={catId} label={titleFromId(catId)} value={score} />
              ))}
            </div>
          </section>
        )}

        {/* Summary */}
        {session.summary && (
          <section className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-accent" />
              AI Session Summary
            </h2>
            <p className="text-sm text-foreground leading-relaxed">{session.summary}</p>
          </section>
        )}

        {/* No data notice */}
        {session.overallScore === undefined &&
          categoryScores.length === 0 &&
          !session.summary && (
            <div className="flex items-start gap-3 bg-muted/40 border border-border rounded-lg px-5 py-4 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Detailed analysis data is not available for this session. The analysis may have
                completed without score data, or this session was recorded before scoring was
                enabled.
              </p>
            </div>
          )}
      </div>
    </AppLayout>
  );
}
