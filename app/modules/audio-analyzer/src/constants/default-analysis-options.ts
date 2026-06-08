import type { TranscriptionAnalysisOptions } from "../libs/types";

/**
 * Default analysis options for InterviewLens — configured for job/HR interview analysis.
 * Speaker roles: interviewer (HR manager) and candidate.
 */
export const defaultAnalysisOptions: TranscriptionAnalysisOptions = {
  context:
    "Professional interview session between an interviewer (HR manager or hiring manager) and a candidate. Evaluate communication clarity, candidate engagement, topic coverage, and interview quality.",
  speaker_roles: ["interviewer", "candidate", "other"],
  primary_role: "interviewer",
  default_role: "candidate",
  role_display: {
    interviewer: "Interviewer",
    candidate: "Candidate",
    other: "Other",
  },
  scoring_rules: [
    {
      id: "communication_clarity",
      title: "Communication Clarity",
      rule: "Score 0-{max_score} for clear and coherent communication. Penalize excessive filler words, unclear answers, and long hesitations.",
      params: { max_score: "100" },
    },
    {
      id: "engagement_responsiveness",
      title: "Engagement & Responsiveness",
      rule: "Score 0-{max_score} for active engagement, on-topic responses, and responsiveness to questions.",
      params: { max_score: "100" },
    },
    {
      id: "topic_coverage",
      title: "Topic Coverage",
      rule: "Score 0-{max_score} for thorough coverage of the interview topic. Penalize significant gaps or unanswered questions.",
      params: { max_score: "100" },
    },
    {
      id: "interview_quality",
      title: "Interview Quality",
      rule: "Score 0-{max_score} for the overall quality of the interview structure, question depth, and session flow.",
      params: { max_score: "100" },
    },
  ],
};
