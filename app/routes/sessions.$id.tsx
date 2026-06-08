import type { LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppLayout, PageHeader } from "~/components/app-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  CheckCircle2,
  Mic2,
  Clock,
  Calendar,
  MessageSquare,
  BarChart2,
  AlertCircle,
  FileText,
  PlayCircle,
  VideoOff,
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

type TranscriptSegment = {
  speaker_id?: string;
  speaker_name?: string | null;
  text: string;
  start_ms?: number;
  end_ms?: number;
};

type SessionData = {
  _id: string;
  filename: string;
  candidateName?: string;
  overallScore?: number;
  categoryScores?: Record<string, number>;
  summary?: string;
  status: string;
  durationMs?: number;
  mediaUrl?: string | null;
  transcription?: string | null;
  createdAt: string;
};

// ─── Helpers ───────────────────────────────────────────────────────────────

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

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function titleFromId(id: string): string {
  return id
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseTranscription(raw: string | null | undefined): TranscriptSegment[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as TranscriptSegment[];
    }
  } catch {
    // not JSON — treat as plain text
  }
  return null;
}

// ─── Sub-components ────────────────────────────────────────────────────────

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
      <p className="text-xs font-medium text-muted-foreground mb-1 truncate">{label}</p>
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

function MetaRow({ session }: { session: SessionData }) {
  return (
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
  );
}

// ─── Left column panels ────────────────────────────────────────────────────

function ScoresPanel({ session }: { session: SessionData }) {
  const categoryScores = session.categoryScores
    ? Object.entries(session.categoryScores)
    : [];

  const hasScores = session.overallScore !== undefined || categoryScores.length > 0;

  if (!hasScores && !session.summary) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Detailed analysis data is not available for this session. The analysis may have
              completed without score data, or this session was recorded before scoring was
              enabled.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {hasScores && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {session.overallScore !== undefined && (
                <ScoreCard label="Overall" value={session.overallScore} />
              )}
              {categoryScores.map(([catId, score]) => (
                <ScoreCard key={catId} label={titleFromId(catId)} value={score} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {session.summary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent" />
              AI Session Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">{session.summary}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// ─── Right column panels ───────────────────────────────────────────────────

function MediaPanel({ mediaUrl }: { mediaUrl: string | null | undefined }) {
  const isAudio =
    mediaUrl
      ? /\.(mp3|wav|ogg|flac|aac|m4a|webm)(\?|$)/i.test(mediaUrl)
      : false;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <PlayCircle className="w-4 h-4" />
          Recording
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!mediaUrl ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 py-10 text-center">
            <VideoOff className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Recording not available</p>
            <p className="text-xs text-muted-foreground/70">
              No media file was stored for this session.
            </p>
          </div>
        ) : isAudio ? (
          <audio
            controls
            className="w-full rounded-lg"
            src={mediaUrl}
            title="Session recording"
          />
        ) : (
          <video
            controls
            className="aspect-video w-full rounded-lg border bg-black object-contain"
            src={mediaUrl}
            title="Session recording"
          />
        )}
      </CardContent>
    </Card>
  );
}

function TranscriptionPanel({
  transcription,
}: {
  transcription: string | null | undefined;
}) {
  const segments = parseTranscription(transcription);

  return (
    <Card className="flex flex-col min-h-0">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Transcription
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto min-h-0 max-h-[480px]">
        {!transcription ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 py-10 text-center">
            <FileText className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Transcription not available</p>
            <p className="text-xs text-muted-foreground/70">
              No transcription was stored for this session.
            </p>
          </div>
        ) : segments ? (
          // Structured segment list
          <div className="space-y-3">
            {segments.map((seg, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-muted/40 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-accent text-xs">
                    {seg.speaker_name || seg.speaker_id || `Speaker ${idx + 1}`}
                  </span>
                  {seg.start_ms !== undefined && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatMs(seg.start_ms)}
                      {seg.end_ms !== undefined && ` – ${formatMs(seg.end_ms)}`}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed text-foreground">{seg.text}</p>
              </div>
            ))}
          </div>
        ) : (
          // Plain text fallback
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {transcription}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function SessionDetailPage() {
  const { session } = useLoaderData<typeof loader>() as { session: SessionData };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Meta row */}
        <MetaRow session={session} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left column — analysis results */}
          <div className="space-y-5">
            <ScoresPanel session={session} />
          </div>

          {/* Right column — media player + transcription */}
          <div className="space-y-5">
            <MediaPanel mediaUrl={session.mediaUrl} />
            <TranscriptionPanel transcription={session.transcription} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
