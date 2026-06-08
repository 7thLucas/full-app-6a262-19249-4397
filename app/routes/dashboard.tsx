import { Link, useNavigate } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { useConfigurables } from "~/modules/configurables";
import { useSessions } from "@qb/audio-analyzer";
import { AppLayout, PageHeader } from "~/components/app-layout";
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Mic2,
  FileText,
  BarChart2,
  History,
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return { user };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(durationMs: number | undefined): string {
  if (durationMs === undefined) return "—";
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" />
        Complete
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
        <Loader2 className="w-3 h-3 animate-spin" />
        Analyzing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      <AlertCircle className="w-3 h-3" />
      Failed
    </span>
  );
}

function ScoreBar({ value }: { value: number }) {
  const color =
    value >= 85 ? "bg-emerald-500" : value >= 70 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-mono font-medium text-foreground w-8 text-right">{value}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { config, loading } = useConfigurables();
  const navigate = useNavigate();
  const { sessions, isLoading: sessionsLoading, error: sessionsError } = useSessions();

  const dashboardHeading = loading
    ? "Your Sessions"
    : (config.dashboardHeading ?? "Your Sessions");

  const totalHoursMs = sessions.reduce((sum, s) => sum + (s.durationMs ?? 0), 0);
  const totalHours = totalHoursMs > 0
    ? (totalHoursMs / 3_600_000).toFixed(1) + "h"
    : "—";
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((s, d) => s + (d.overallScore ?? 0), 0) /
            completedSessions.length,
        )
      : 0;

  const statsData = [
    { label: "Total Sessions", value: sessions.length, icon: FileText },
    { label: "Avg. Score", value: completedSessions.length > 0 ? avgScore : "—", icon: BarChart2 },
    { label: "Hours Analyzed", value: totalHours, icon: Clock },
  ];

  return (
    <AppLayout>
      <PageHeader
        title={dashboardHeading}
        subtitle="All your analyzed interview sessions"
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/analysis-history"
              className="inline-flex items-center gap-2 bg-muted text-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-muted/80 transition-colors"
            >
              <History className="w-4 h-4" />
              History
            </Link>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-semibold px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              New Analysis
            </Link>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Sessions list */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Recent Sessions
          </h2>

          {sessionsLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading sessions…</span>
            </div>
          )}

          {sessionsError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {sessionsError}
            </div>
          )}

          {!sessionsLoading && !sessionsError && sessions.length === 0 && (
            <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
              <Mic2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">No sessions yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Upload your first interview recording to get started.
              </p>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-semibold px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                New Analysis
              </Link>
            </div>
          )}

          {!sessionsLoading && !sessionsError && sessions.length > 0 && (
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session) => (
                <Link
                  key={session._id}
                  to={`/sessions/${session._id}`}
                  className="block bg-card border border-border rounded-lg p-5 hover:border-accent/40 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                        <Mic2 className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {session.candidateName ?? session.filename}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {session.durationMs !== undefined && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {formatDuration(session.durationMs)}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(session.createdAt)}
                          </span>
                          <StatusBadge status={session.status} />
                        </div>
                      </div>
                    </div>
                    {session.overallScore !== undefined && (
                      <div className="shrink-0 w-32">
                        <p className="text-xs text-muted-foreground mb-1 text-right">
                          Overall Score
                        </p>
                        <ScoreBar value={session.overallScore} />
                      </div>
                    )}
                  </div>
                  {session.summary && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {session.summary}
                    </p>
                  )}
                </Link>
              ))}
              {sessions.length > 10 && (
                <Link
                  to="/analysis-history"
                  className="block text-center text-sm text-accent font-medium py-3 hover:underline"
                >
                  View all {sessions.length} sessions in History
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
