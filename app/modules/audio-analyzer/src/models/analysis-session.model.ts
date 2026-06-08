import { prop, getModelForClass, modelOptions, index } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

@modelOptions({
  schemaOptions: {
    collection: "analysis_sessions",
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
})
@index({ userId: 1, createdAt: -1 })
export class AnalysisSession extends TimeStamps {
  @prop({ type: String, required: true })
  userId!: string;

  @prop({ type: String, required: true })
  ticketId!: string;

  @prop({ type: String, required: true })
  filename!: string;

  @prop({ type: String, required: false })
  candidateName?: string;

  /** Overall quality score (0–100), averaged from category scores */
  @prop({ type: Number, required: false })
  overallScore?: number;

  /** Per-category scores map, e.g. { communication: 88, engagement: 90 } */
  @prop({ type: () => Map, of: Number, required: false })
  categoryScores?: Map<string, number>;

  /** AI-generated session summary */
  @prop({ type: String, required: false })
  summary?: string;

  /** Final status of the analysis job: "completed" | "failed" */
  @prop({ type: String, required: true, default: "completed" })
  status!: string;

  /** Total duration of the audio in milliseconds */
  @prop({ type: Number, required: false })
  durationMs?: number;

  /** URL of the stored media file (audio or video) */
  @prop({ type: String, required: false })
  mediaUrl?: string;

  /**
   * Full transcription text, or a JSON-serialised array of
   * { speaker, text, start_ms, end_ms } segment objects.
   */
  @prop({ type: String, required: false })
  transcription?: string;
}

export const AnalysisSessionModel = getModelForClass(AnalysisSession);
