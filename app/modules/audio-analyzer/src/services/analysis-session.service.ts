import { AnalysisSessionModel } from "../models/analysis-session.model";
import type { AnalysisResult } from "../libs/types";

export type CreateAnalysisSessionInput = {
  userId: string;
  ticketId: string;
  filename: string;
  candidateName?: string;
  analysis: AnalysisResult | null;
  status: string;
  durationMs?: number;
};

/** Derive an overall 0-100 score from the analysis result. */
function computeOverallScore(analysis: AnalysisResult | null): number | undefined {
  if (!analysis) return undefined;

  const scores: number[] = [];

  // Try category_evaluations first
  if (analysis.category_evaluations?.length) {
    for (const ev of analysis.category_evaluations) {
      if (typeof ev.score === "number") {
        scores.push(ev.score);
      }
    }
  }

  // Fall back to chunks → category_scores
  if (scores.length === 0 && analysis.chunks?.length) {
    for (const chunk of analysis.chunks) {
      if (chunk.category_scores) {
        for (const cs of Object.values(chunk.category_scores)) {
          if (typeof cs.score === "number") {
            scores.push(cs.score);
          }
        }
      }
    }
  }

  if (scores.length === 0) return undefined;
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  return Math.round(avg);
}

/** Derive per-category score map from the analysis result. */
function computeCategoryScores(
  analysis: AnalysisResult | null,
): Map<string, number> | undefined {
  if (!analysis) return undefined;

  const byCategory = new Map<string, number[]>();

  if (analysis.category_evaluations?.length) {
    for (const ev of analysis.category_evaluations) {
      if (typeof ev.score === "number") {
        const arr = byCategory.get(ev.category_id) ?? [];
        arr.push(ev.score);
        byCategory.set(ev.category_id, arr);
      }
    }
  } else if (analysis.chunks?.length) {
    for (const chunk of analysis.chunks) {
      if (chunk.category_scores) {
        for (const [catId, cs] of Object.entries(chunk.category_scores)) {
          if (typeof cs.score === "number") {
            const arr = byCategory.get(catId) ?? [];
            arr.push(cs.score);
            byCategory.set(catId, arr);
          }
        }
      }
    }
  }

  if (byCategory.size === 0) return undefined;

  const result = new Map<string, number>();
  for (const [catId, values] of byCategory.entries()) {
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    result.set(catId, Math.round(avg));
  }
  return result;
}

export class AnalysisSessionService {
  /** Upsert a session record (idempotent by ticketId + userId). */
  static async upsertSession(input: CreateAnalysisSessionInput) {
    const overallScore = computeOverallScore(input.analysis);
    const categoryScores = computeCategoryScores(input.analysis);
    const summary = input.analysis?.summary ?? undefined;

    const doc = await AnalysisSessionModel.findOneAndUpdate(
      { ticketId: input.ticketId, userId: input.userId },
      {
        $set: {
          userId: input.userId,
          ticketId: input.ticketId,
          filename: input.filename,
          ...(input.candidateName !== undefined && { candidateName: input.candidateName }),
          ...(overallScore !== undefined && { overallScore }),
          ...(categoryScores !== undefined && { categoryScores }),
          ...(summary !== undefined && { summary }),
          status: input.status,
          ...(input.durationMs !== undefined && { durationMs: input.durationMs }),
        },
      },
      { upsert: true, new: true },
    );

    return doc;
  }

  /** List all sessions for a user, newest first. */
  static async listSessions(userId: string, limit = 50) {
    return AnalysisSessionModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /** Get a single session by MongoDB _id for a given user. */
  static async getSessionById(id: string, userId: string) {
    return AnalysisSessionModel.findOne({ _id: id, userId }).lean();
  }
}
