import { Link, useNavigate } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { useConfigurables } from "~/modules/configurables";
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
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return { user };
}

// Placeholder session data for demo purposes
const DEMO_SESSIONS = [
  {
    id: "demo-1",
    filename: "candidate_sarah_chen.mp3",
    duration: "32:14",
    status: "completed",
    createdAt: "2026-06-07T14:22:00Z",
    summary: "Strong communication skills. High engagement on technical questions. Some hesitation on leadership topics.",
    scores: { overall: 82, communication: 88, engagement: 90, topicCoverage: 76, interviewQuality: 80 },
  },
  {
    id: "demo-2",
    filename: "research_session_june6.wav",
    duration: "58:03",
    status: "completed",
    createdAt: "2026-06-06T10:05:00Z",
    summary: "Deep exploration of UX pain points. Candidate articulated user journey clearly with specific examples.",
    scores: { overall: 91, communication: 89, engagement: 94, topicCoverage: 93, interviewQuality: 87 },
  },
  {
    id: "demo-3",
    filename: "initial_screening_alex.m4a",
    duration: "18:47",
    status: "completed",
    createdAt: "2026-06-05T16:30:00Z",
    summary: "Brief screening call. Basic qualifications confirmed. Recommend full interview round.",
    scores: { overall: 68, communication: 72, engagement: 65, topicCoverage: 70, interviewQuality: 73 },
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

  const dashboardHeading = loading
    ? "Your Sessions"
    : (config.dashboardHeading ?? "Your Sessions");

  const statsData = [
    { label: "Total Sessions", value: DEMO_SESSIONS.length, icon: FileText },
    {
      label: "Avg. Score",
      value: Math.round(
        DEMO_SESSIONS.reduce((s, d) => s + d.scores.overall, 0) / DEMO_SESSIONS.length
      ),
      icon: BarChart2,
    },
    {
      label: "Hours Analyzed",
      value: "1.8h",
      icon: Clock,
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title={dashboardHeading}
        subtitle="All your analyzed interview sessions"
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
          <div className="space-y-3">
            {DEMO_SESSIONS.map((session) => (
              <Link
                key={session.id}
                to={`/sessions/${session.id}`}
                className="block bg-card border border-border rounded-lg p-5 hover:border-accent/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                      <Mic2 className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{session.filename}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          {session.duration}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(session.createdAt)}
                        </span>
                        <StatusBadge status={session.status} />
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 w-32">
                    <p className="text-xs text-muted-foreground mb-1 text-right">
                      Overall Score
                    </p>
                    <ScoreBar value={session.scores.overall} />
                  </div>
                </div>
                {session.summary && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {session.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
