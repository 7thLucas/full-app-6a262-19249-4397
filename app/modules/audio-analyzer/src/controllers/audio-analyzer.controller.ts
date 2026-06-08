import type { Request, Response } from "express";
import multer from "multer";
import { resolveAnalysisOptions } from "../constants/resolve-analysis-options";
import { audioAnalyzer, AudioAnalyzerError } from "../libs/audio-analyzer";
import type { TranscribeFileInput } from "../libs/types";
import { AnalysisSessionService } from "../services/analysis-session.service";

export const transcribeUpload = multer({
  storage: multer.memoryStorage(),
}).array("files");

function routeParam(value: string | string[] | undefined): string {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return "";
}

export async function pingAudioAnalyzer(_req: Request, res: Response) {
  const envelope = await audioAnalyzer.ping();
  return res.json({ ok: true, upstream: envelope.result });
}

export async function postTranscribe(req: Request, res: Response) {
  const files = (req.files ?? []) as Express.Multer.File[];

  if (files.length === 0) {
    return res.status(400).json({
      ok: false,
      message: "At least one file is required (form field: files)",
    });
  }

  const analysisOptions = resolveAnalysisOptions(
    req.body?.analysis_options as string | undefined,
  );

  const inputs: TranscribeFileInput[] = files.map((file) => ({
    filename: file.originalname,
    data: file.buffer,
    mimeType: file.mimetype,
  }));

  const envelope = await audioAnalyzer.transcribe(inputs, {
    analysis_options: analysisOptions,
  });

  return res.json(envelope);
}

export async function getTranscribeStatus(req: Request, res: Response) {
  const ticketId = routeParam(req.params.ticketId);
  const envelope = await audioAnalyzer.trackTranscribe(ticketId);
  return res.json(envelope);
}

export async function getTranscribeAsset(req: Request, res: Response) {
  const ticketId = routeParam(req.params.ticketId);
  const filename = routeParam(req.params.filename);
  const asset = await audioAnalyzer.getAsset(ticketId, filename);

  if (asset.contentType) {
    res.setHeader("Content-Type", asset.contentType);
  }
  if (asset.contentLength) {
    res.setHeader("Content-Length", asset.contentLength);
  }

  req.on("close", () => {
    if (!res.writableEnded) {
      asset.stream.destroy();
    }
  });

  asset.stream.on("error", (error) => {
    if (!res.headersSent) {
      throw error;
    }
    res.destroy();
  });

  asset.stream.pipe(res);
}

/**
 * POST /api/audio-analyzer/sessions
 * Save (upsert) a completed analysis session to MongoDB.
 * Body: { ticketId, filename, candidateName?, analysis, status, durationMs? }
 */
export async function postSaveSession(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ ok: false, message: "Authentication required" });
  }

  const { ticketId, filename, candidateName, analysis, status, durationMs, mediaUrl, transcription } = req.body as {
    ticketId: string;
    filename: string;
    candidateName?: string;
    analysis: unknown;
    status?: string;
    durationMs?: number;
    mediaUrl?: string;
    transcription?: string;
  };

  if (!ticketId || !filename) {
    return res.status(400).json({ ok: false, message: "ticketId and filename are required" });
  }

  const session = await AnalysisSessionService.upsertSession({
    userId,
    ticketId,
    filename,
    candidateName,
    analysis: analysis as any,
    status: status ?? "completed",
    durationMs,
    mediaUrl,
    transcription,
  });

  return res.json({ ok: true, session });
}

/**
 * GET /api/audio-analyzer/sessions
 * List all persisted analysis sessions for the authenticated user.
 */
export async function getSessions(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ ok: false, message: "Authentication required" });
  }

  const sessions = await AnalysisSessionService.listSessions(userId);
  return res.json({ ok: true, sessions });
}

/**
 * GET /api/audio-analyzer/sessions/:id
 * Get a single persisted session by its MongoDB _id.
 */
export async function getSessionById(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ ok: false, message: "Authentication required" });
  }

  const id = routeParam(req.params.id);
  const session = await AnalysisSessionService.getSessionById(id, userId);

  if (!session) {
    return res.status(404).json({ ok: false, message: "Session not found" });
  }

  return res.json({ ok: true, session });
}

export function handleAudioAnalyzerError(
  res: Response,
  error: unknown,
  context: string,
) {
  if (error instanceof AudioAnalyzerError) {
    return res.status(error.status >= 400 ? error.status : 502).json({
      ok: false,
      message: error.message,
      detail: error.body,
    });
  }

  console.error(`${context}:`, error);
  return res.status(502).json({
    ok: false,
    message: "Audio analyzer service unavailable",
  });
}
