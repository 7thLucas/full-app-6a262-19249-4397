import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { useConfigurables } from "~/modules/configurables";
import { AppLayout, PageHeader } from "~/components/app-layout";
import {
  useTranscribe,
  TranscriptionUpload,
  TranscriptionResult,
} from "@qb/audio-analyzer";
import { Shield, Zap, Info } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return { user };
}

export default function AnalyzePage() {
  const { config, loading } = useConfigurables();
  const { submit, ticketId, isSubmitting, error: submitError } = useTranscribe();

  const uploadHeading = loading
    ? "Analyze a New Interview"
    : (config.uploadSectionHeading ?? "Analyze a New Interview");

  const uploadHint = loading
    ? "Drag and drop an MP3, WAV, or M4A file — or click to browse"
    : (config.uploadHint ?? "Drag and drop an MP3, WAV, or M4A file — or click to browse");

  return (
    <AppLayout>
      <PageHeader
        title={uploadHeading}
        subtitle="Upload an audio recording to receive a full intelligence report"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "New Analysis" }]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Info banner */}
        <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 text-sm text-foreground">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Supported formats: MP3, WAV, M4A, OGG, MP4</p>
            <p className="text-muted-foreground mt-0.5">
              Maximum 2 hours per session. Audio is processed and immediately deleted after analysis.
            </p>
          </div>
        </div>

        {/* Upload area */}
        {!ticketId && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Upload Recording</h2>
            <TranscriptionUpload
              isLoading={isSubmitting}
              onUpload={(file) => submit({ files: file })}
              label="Click or drag your audio file here"
              hint={uploadHint}
              loadingLabel="Uploading and queuing analysis…"
              draggingLabel="Drop the file to start"
              className="[&>div]:border-border [&>div:hover]:border-accent/60 [&>div]:transition-colors"
            />
            {submitError && (
              <div className="mt-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-4 py-3">
                {submitError}
              </div>
            )}
          </div>
        )}

        {/* Analysis result — shows once a ticket is queued */}
        {ticketId && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <TranscriptionResult ticketId={ticketId}>
              <TranscriptionResult.Loading />
              <TranscriptionResult.Error />
              <TranscriptionResult.Content>
                <div className="p-5 border-b border-border">
                  <TranscriptionResult.Header />
                  <TranscriptionResult.Status />
                </div>
                <div className="p-5 space-y-6">
                  <TranscriptionResult.Scores />
                  <TranscriptionResult.Summary />
                  <TranscriptionResult.Strengths />
                  <TranscriptionResult.Issues />
                  <TranscriptionResult.Transcript />
                  <TranscriptionResult.Media />
                  <TranscriptionResult.Logs />
                </div>
              </TranscriptionResult.Content>
            </TranscriptionResult>
          </div>
        )}

        {/* Trust signal */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground py-2">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-accent" />
            Audio deleted after processing
          </span>
          <span className="hidden sm:block text-border">|</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent" />
            Results in under 60 seconds
          </span>
        </div>
      </div>
    </AppLayout>
  );
}
