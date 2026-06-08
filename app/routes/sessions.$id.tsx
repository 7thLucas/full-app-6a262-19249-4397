import type { LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppLayout, PageHeader } from "~/components/app-layout";
import {
  CheckCircle2,
  Mic2,
  Clock,
  Calendar,
  TrendingUp,
  MessageSquare,
  BarChart2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  // Demo session data — in production this would be fetched from DB
  const DEMO_SESSIONS: Record<string, DemoSession> = {
    "demo-1": {
      id: "demo-1",
      filename: "candidate_sarah_chen.mp3",
      duration: "32:14",
      status: "completed",
      createdAt: "2026-06-07T14:22:00Z",
      summary:
        "Sarah demonstrated strong communication skills throughout the interview. Engagement was notably high on technical questions, with clear and structured answers. Some hesitation was observed when discussing leadership experience, which may warrant follow-up. Talk-time ratio was well-balanced (interviewer 38%, candidate 62%).",
      scores: {
        overall: 82,
        communication: 88,
        engagement: 90,
        topicCoverage: 76,
        interviewQuality: 80,
      },
      highlights: [
        "Clear explanation of distributed systems architecture (12:34–14:18)",
        "Specific example of cross-team collaboration with measurable outcome (22:05)",
        "Hesitation and self-correction when asked about team leadership (26:41–27:12)",
      ],
      topics: ["Distributed Systems", "API Design", "Team Collaboration", "Leadership", "Conflict Resolution"],
      talkTime: { interviewer: 38, candidate: 62 },
      fillers: { interviewer: 12, candidate: 28 },
    },
    "demo-2": {
      id: "demo-2",
      filename: "research_session_june6.wav",
      duration: "58:03",
      status: "completed",
      createdAt: "2026-06-06T10:05:00Z",
      summary:
        "Deep and productive exploration of UX pain points. The candidate demonstrated exceptional ability to articulate user journeys with specific, quantified examples. Sentiment remained consistently positive and engaged across the full session.",
      scores: {
        overall: 91,
        communication: 89,
        engagement: 94,
        topicCoverage: 93,
        interviewQuality: 87,
      },
      highlights: [
        "Detailed walkthrough of user onboarding friction with data reference (08:22–11:40)",
        "Unprompted insight on accessibility gaps (34:55)",
        "Strong closing synthesis connecting all themes (51:10–53:40)",
      ],
      topics: ["User Research", "Onboarding Flow", "Accessibility", "Pain Points", "Design Iteration"],
      talkTime: { interviewer: 32, candidate: 68 },
      fillers: { interviewer: 8, candidate: 19 },
    },
    "demo-3": {
      id: "demo-3",
      filename: "initial_screening_alex.m4a",
      duration: "18:47",
      status: "completed",
      createdAt: "2026-06-05T16:30:00Z",
      summary:
        "Brief screening call that confirmed basic qualifications. Communication was clear but surface-level. Recommend scheduling a full interview to explore depth of experience and culture fit.",
      scores: {
        overall: 68,
        communication: 72,
        engagement: 65,
        topicCoverage: 70,
        interviewQuality: 73,
      },
      highlights: [
        "Confirmed 4 years of relevant experience (03:12)",
        "Interest in growth opportunities clearly stated (09:44)",
        "Limited elaboration on past projects when prompted (14:30–15:02)",
      ],
      topics: ["Experience", "Skills", "Culture Fit", "Career Goals"],
      talkTime: { interviewer: 45, candidate: 55 },
      fillers: { interviewer: 6, candidate: 22 },
    },
  };

  const session = DEMO_SESSIONS[params.id ?? ""];
  if (!session) return redirect("/dashboard");

  return { session, user };
}

type DemoSession = {
  id: string;
  filename: string;
  duration: string;
  status: string;
  createdAt: string;
  summary: string;
  scores: Record<string, number>;
  highlights: string[];
  topics: string[];
  talkTime: { interviewer: number; candidate: number };
  fillers: { interviewer: number; candidate: number };
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color =
    value >= 85 ? "text-emerald-600" : value >= 70 ? "text-amber-600" : "text-red-500";
  const bg =
    value >= 85 ? "bg-emerald-50 border-emerald-200" : value >= 70 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
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

function TalkTimeBar({ interviewer, candidate }: { interviewer: number; candidate: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
        <span>Interviewer {interviewer}%</span>
        <span>Candidate {candidate}%</span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden">
        <div
          className="bg-[#1E2D45] transition-all"
          style={{ width: `${interviewer}%` }}
        />
        <div
          className="bg-accent transition-all"
          style={{ width: `${candidate}%` }}
        />
      </div>
      {interviewer > candidate && (
        <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Interviewer dominated conversation
        </p>
      )}
    </div>
  );
}

export default function SessionDetailPage() {
  const { session } = useLoaderData<typeof loader>() as { session: DemoSession };

  return (
    <AppLayout>
      <PageHeader
        title={session.filename}
        subtitle={`Analyzed on ${formatDate(session.createdAt)}`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: session.filename },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {session.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(session.createdAt)}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Analysis complete
          </span>
        </div>

        {/* Scores */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Scores
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <ScoreCard label="Overall" value={session.scores.overall} />
            <ScoreCard label="Communication" value={session.scores.communication} />
            <ScoreCard label="Engagement" value={session.scores.engagement} />
            <ScoreCard label="Topic Coverage" value={session.scores.topicCoverage} />
            <ScoreCard label="Interview Quality" value={session.scores.interviewQuality} />
          </div>
        </section>

        {/* Summary */}
        <section className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-accent" />
            AI Session Summary
          </h2>
          <p className="text-sm text-foreground leading-relaxed">{session.summary}</p>
        </section>

        {/* Highlights */}
        <section className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-accent" />
            Key Moments
          </h2>
          <ul className="space-y-2.5">
            {session.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-foreground">{h}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Topics + Talk time row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Topics */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Topics Extracted</h2>
            <div className="flex flex-wrap gap-2">
              {session.topics.map((topic) => (
                <span
                  key={topic}
                  className="inline-block text-xs font-medium bg-muted text-secondary border border-border px-2.5 py-1 rounded-full font-mono"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Talk time */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Talk-Time Ratio</h2>
            <TalkTimeBar
              interviewer={session.talkTime.interviewer}
              candidate={session.talkTime.candidate}
            />
            <div className="mt-5 pt-4 border-t border-border">
              <h3 className="text-xs text-muted-foreground font-medium mb-2">
                Filler Words Detected
              </h3>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-mono font-semibold text-foreground">
                    {session.fillers.interviewer}
                  </span>
                  <span className="text-muted-foreground ml-1.5">interviewer</span>
                </div>
                <div>
                  <span className="font-mono font-semibold text-foreground">
                    {session.fillers.candidate}
                  </span>
                  <span className="text-muted-foreground ml-1.5">candidate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
