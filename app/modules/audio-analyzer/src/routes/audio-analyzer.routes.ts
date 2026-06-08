import { Router } from "express";
import { requireAuth } from "~/modules/authentication/authentication.middleware";
import {
  getTranscribeAsset,
  getTranscribeStatus,
  handleAudioAnalyzerError,
  pingAudioAnalyzer,
  postTranscribe,
  transcribeUpload,
  postSaveSession,
  getSessions,
  getSessionById,
} from "../controllers/audio-analyzer.controller";

const router = Router();

router.get("/audio-analyzer/ping", async (req, res) => {
  try {
    return await pingAudioAnalyzer(req, res);
  } catch (error) {
    return handleAudioAnalyzerError(res, error, "Audio analyzer ping failed");
  }
});

router.post("/audio-analyzer/transcribe", transcribeUpload, async (req, res) => {
  try {
    return await postTranscribe(req, res);
  } catch (error) {
    return handleAudioAnalyzerError(res, error, "Audio analyzer transcribe failed");
  }
});

router.get("/audio-analyzer/transcribe/:ticketId", async (req, res) => {
  try {
    return await getTranscribeStatus(req, res);
  } catch (error) {
    return handleAudioAnalyzerError(res, error, "Audio analyzer track failed");
  }
});

router.get("/audio-analyzer/assets/:ticketId/:filename", async (req, res) => {
  try {
    return await getTranscribeAsset(req, res);
  } catch (error) {
    return handleAudioAnalyzerError(res, error, "Audio analyzer asset failed");
  }
});

// Session persistence endpoints — all require authentication
router.post("/audio-analyzer/sessions", requireAuth, async (req, res) => {
  try {
    return await postSaveSession(req, res);
  } catch (error) {
    console.error("Save session failed:", error);
    return res.status(500).json({ ok: false, message: "Failed to save session" });
  }
});

router.get("/audio-analyzer/sessions", requireAuth, async (req, res) => {
  try {
    return await getSessions(req, res);
  } catch (error) {
    console.error("List sessions failed:", error);
    return res.status(500).json({ ok: false, message: "Failed to list sessions" });
  }
});

router.get("/audio-analyzer/sessions/:id", requireAuth, async (req, res) => {
  try {
    return await getSessionById(req, res);
  } catch (error) {
    console.error("Get session failed:", error);
    return res.status(500).json({ ok: false, message: "Failed to get session" });
  }
});

export default router;
