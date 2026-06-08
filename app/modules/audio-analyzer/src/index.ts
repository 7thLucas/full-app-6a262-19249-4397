// ─────────────────────────────────────────────────────────────────────────────
// Client-safe exports only.
//
// Server-only modules (controller, routes, audio-analyzer lib) must NOT be
// re-exported here. Import those directly on the server:
//
//   import audioAnalyzerRoutes from "~/modules/audio-analyzer/src/routes/audio-analyzer.routes";
//   import { audioAnalyzer } from "~/modules/audio-analyzer/src/libs/audio-analyzer";
// ─────────────────────────────────────────────────────────────────────────────

export * from "./src/hooks/use-transcribe";
export * from "./src/hooks/use-transcription-result";
export {
  TranscriptionResult,
  TranscriptionResultProvider,
  useTranscriptionResultContext,
} from "./src/components/transcription-result";
export { TranscriptionUpload } from "./src/components/transcription-upload";
export type { TranscriptionUploadProps } from "./src/components/transcription-upload";
export type {
  TranscriptionResultRootProps,
  TranscriptionResultContextValue,
} from "./src/components/transcription-result";
export type {
  AnalysisResult,
  CategoryEvaluation,
  ChatSegment,
  JobLogEntry,
  ResponseEnvelope,
  TrackTranscribeResult,
  TranscribeResult,
  TranscriptionAnalysisOptions,
  TranscriptionAnalysisPassSettings,
} from "./src/libs/types";
