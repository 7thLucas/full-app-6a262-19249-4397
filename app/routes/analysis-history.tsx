import { Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { useSessions } from "@qb/audio-analyzer";
import { AppLayout, PageHeader } from "~/components/app-layout";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Mic2,
  PlusCircle,
  ArrowRight,
  Search,
} from "lucide-react";
import { useState } from "react";

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
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(durationMs: number | undefined): string {
  if (durationMs === undefined) return "";
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function ScoreBadge({ score }: { score: number | undefined }) {
  if (score === undefined) return null;
  const colorClass =
    score >= 85
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : score >= 70
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-red-700 bg-red-50 border-red-200";
  return (
    <span
      className={`inline-flex items-center text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}
    >
      {score}
    </span>
  );
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

export default function AnalysisHistoryPage() {
  const { sessions, isLoading, error } = useSessions();
  const [search, setSearch] = useState("");

  const filteredSessions = search.trim()
    ? sessions.filter((s) => {
        const q = search.toLowerCase();
        return (
          s.filename.toLowerCase().includes(q) ||
          (s.candidateName ?? "").toLowerCase().includes(q) ||
          (s.summary ?? "").toLowerCase().includes(q)
        );
      })
    : sessions;

  return (
    <AppLayout>
      <PageHeader
        title="Analysis History"
        subtitle={`${sessions.length} session${sessions.length !== 1 ? "s" : ""} analyzed`}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Analysis History" }]}
        actions={
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-semibold px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Analysis
          </Link>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Search bar */}
        {sessions.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename, candidate name, or summary…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Loading history…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && sessions.length === 0 && (
          <div className="text-center py-20 bg-card border border-dashed border-border rounded-xl">
            <Mic2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">No sessions yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-5">
              Upload your first audio recording to start building your history.
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

        {/* No search results */}
        {!isLoading && !error && sessions.length > 0 && filteredSessions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No sessions match your search.</p>
          </div>
        )}

        {/* Sessions table */}
        {!isLoading && !error && filteredSessions.length > 0 && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-border bg-muted/40">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Session</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Score</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</span>
              <span className="sr-only">View</span>
            </div>
            <div className="divide-y divide-border">
              {filteredSessions.map((session) => (
                <Link
                  key={session._id}
                  to={`/sessions/${session._id}`}
                  className="flex sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group"
                >
                  {/* Name / filename */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                      <Mic2 className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.candidateName ?? session.filename}
                      </p>
                      {session.candidateName && (
                        <p className="text-xs text-muted-foreground truncate">{session.filename}</p>
                      )}
                      {session.durationMs !== undefined && (
                        <p className="text-xs text-muted-foreground font-mono sm:hidden mt-0.5">
                          {formatDuration(session.durationMs)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center justify-center">
                    <ScoreBadge score={session.overallScore} />
                  </div>

                  {/* Status */}
                  <div>
                    <StatusBadge status={session.status} />
                  </div>

                  {/* Date */}
                  <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                    {formatDate(session.createdAt)}
                  </span>

                  {/* Arrow */}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !error && filteredSessions.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Showing {filteredSessions.length} of {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </AppLayout>
  );
}
