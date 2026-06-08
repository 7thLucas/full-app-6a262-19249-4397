/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TPricingPlan = {
  name: string;
  price: string;
  description?: string;
  highlighted?: boolean;
  features: string[];
};

export type TFeature = {
  title: string;
  description: string;
  icon?: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  brandColor: TBrandColor;
  heroHeading: string;
  heroSubheading: string;
  heroCta: string;
  features: TFeature[];
  pricingPlans: TPricingPlan[];
  uploadSectionHeading: string;
  uploadHint: string;
  dashboardHeading: string;
  footerText: string;
  showPricing: boolean;
  showFeatures: boolean;
  privacyStatement: string;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "InterviewLens",
  tagline: "Turn interview recordings into honest, actionable insight.",
  logoUrl: "FILL_LOGO_URL_HERE",
  faviconUrl: "",
  brandColor: {
    primary: "#1E2D45",
    secondary: "#4A5568",
    accent: "#F6A623",
  },
  heroHeading: "Understand every interview at a deeper level",
  heroSubheading:
    "Upload your audio recording and get a full transcript, sentiment arc, talk-time breakdown, topic map, and AI-generated summary — in under 60 seconds.",
  heroCta: "Analyze an Interview",
  features: [
    {
      title: "Auto-Transcription",
      description:
        "Fast, accurate speech-to-text with speaker labels and precise timestamps for every segment.",
      icon: "FileText",
    },
    {
      title: "Sentiment Analysis",
      description:
        "Per-speaker emotional tone charted across the session so you can pinpoint tension or rapport.",
      icon: "TrendingUp",
    },
    {
      title: "Topic Extraction",
      description:
        "Key themes ranked by frequency and importance — no more re-reading to find what mattered.",
      icon: "Tags",
    },
    {
      title: "Talk-Time Analytics",
      description:
        "Visual ratio breakdown that flags sessions where the interviewer spoke more than the subject.",
      icon: "BarChart2",
    },
    {
      title: "Filler & Hesitation Detection",
      description:
        "Counts of 'um', 'uh', pauses, and restarts per speaker — a signal for coaching and evaluation.",
      icon: "AlertCircle",
    },
    {
      title: "AI Session Summary",
      description:
        "Executive summary with the top 3–5 highlight moments, ready to share with stakeholders.",
      icon: "Sparkles",
    },
  ],
  pricingPlans: [
    {
      name: "Free",
      price: "Free",
      description: "For occasional use and evaluation.",
      highlighted: false,
      features: [
        "3 sessions per month",
        "Up to 30 min per session",
        "Transcript & speaker labels",
        "Basic summary",
      ],
    },
    {
      name: "Pro",
      price: "$19/mo",
      description: "For individual professionals who run regular interviews.",
      highlighted: true,
      features: [
        "Unlimited sessions",
        "Up to 2 hours per session",
        "Full analysis suite",
        "PDF export & shareable link",
        "Priority processing",
      ],
    },
    {
      name: "Team",
      price: "$79/mo",
      description: "For HR teams and research groups.",
      highlighted: false,
      features: [
        "Everything in Pro",
        "5 team seats",
        "Shared workspace",
        "Admin dashboard",
        "Team analytics",
      ],
    },
  ],
  uploadSectionHeading: "Analyze a New Interview",
  uploadHint: "Drag and drop an MP3, WAV, or M4A file — or click to browse. Max 2 hours.",
  dashboardHeading: "Your Sessions",
  footerText:
    "© 2026 InterviewLens. Audio is processed and immediately deleted. Transcripts are encrypted at rest.",
  showPricing: true,
  showFeatures: true,
  privacyStatement:
    "Audio is processed then permanently deleted. Transcripts are encrypted at rest. We never share your data.",
};
