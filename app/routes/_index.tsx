import { Link } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { useAuth } from "~/modules/authentication/use-authentication";
import {
  FileText,
  TrendingUp,
  Tags,
  BarChart2,
  AlertCircle,
  Sparkles,
  Mic2,
  ArrowRight,
  Shield,
  Zap,
  Check,
  ChevronRight,
} from "lucide-react";
import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

// Redirect logged-in users straight to dashboard
export async function loader({ request }: LoaderFunctionArgs) {
  // We check auth via cookie on the client; landing is publicly accessible
  return null;
}

const iconMap: Record<string, React.ElementType> = {
  FileText,
  TrendingUp,
  Tags,
  BarChart2,
  AlertCircle,
  Sparkles,
};

function FeatureIcon({ name }: { name?: string }) {
  const Icon = (name && iconMap[name]) ? iconMap[name] : Sparkles;
  return <Icon className="w-5 h-5" />;
}

export default function LandingPage() {
  const { config, loading } = useConfigurables();
  const { isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const appName = config.appName ?? "InterviewLens";
  const tagline = config.tagline ?? "Turn interview recordings into honest, actionable insight.";
  const heroHeading = config.heroHeading ?? "Understand every interview at a deeper level";
  const heroSubheading =
    config.heroSubheading ??
    "Upload your audio recording and get a full transcript, sentiment arc, talk-time breakdown, topic map, and AI-generated summary — in under 60 seconds.";
  const heroCta = config.heroCta ?? "Analyze an Interview";
  const features = config.features ?? [];
  const pricingPlans = config.pricingPlans ?? [];
  const showFeatures = config.showFeatures !== false;
  const showPricing = config.showPricing !== false;
  const footerText = config.footerText ?? `© ${new Date().getFullYear()} ${appName}.`;
  const privacyStatement =
    config.privacyStatement ??
    "Audio is processed then permanently deleted. Transcripts encrypted at rest.";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#1E2D45]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <Mic2 className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-bold text-[15px] text-white tracking-tight">{appName}</span>
          </div>
          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium bg-accent text-accent-foreground px-4 py-1.5 rounded-md hover:bg-accent/90 transition-colors"
              >
                Dashboard
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="flex items-center gap-1.5 text-sm font-medium bg-accent text-accent-foreground px-4 py-1.5 rounded-md hover:bg-accent/90 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#1E2D45] text-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-medium text-white/80 mb-6">
            <Zap className="w-3.5 h-3.5 text-accent" />
            Results in under 60 seconds
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            {heroHeading}
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-8">
            {heroSubheading}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={isAuthenticated ? "/analyze" : "/auth/register"}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition-colors text-sm"
            >
              {heroCta}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-medium px-6 py-3 rounded-md hover:bg-white/15 transition-colors text-sm border border-white/20"
              >
                Sign In
              </Link>
            )}
          </div>
          <p className="mt-5 text-xs text-white/40 flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3" />
            {privacyStatement}
          </p>
        </div>
      </section>

      {/* Features */}
      {showFeatures && features.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Everything you need from an interview
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                One upload. A full intelligence report — no manual transcription, no scattered notes.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="bg-card rounded-lg border border-border p-5 hover:border-accent/40 hover:shadow-sm transition-all"
                >
                  <div className="w-9 h-9 rounded-md bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <FeatureIcon name={feature.icon} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      {showPricing && pricingPlans.length > 0 && (
        <section className="py-20 bg-muted/40 border-y border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Simple, honest pricing
              </h2>
              <p className="text-muted-foreground">
                Start free. Upgrade when you need more.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pricingPlans.map((plan, i) => (
                <div
                  key={i}
                  className={`bg-card rounded-xl border p-6 flex flex-col ${
                    plan.highlighted
                      ? "border-accent ring-1 ring-accent shadow-md"
                      : "border-border"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="mb-4">
                      <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-2 mb-1">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground mb-5">{plan.description}</p>
                  )}
                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link
                      to="/auth/register"
                      className={`block text-center text-sm font-semibold px-4 py-2.5 rounded-md transition-colors ${
                        plan.highlighted
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "bg-muted text-foreground hover:bg-muted/70 border border-border"
                      }`}
                    >
                      {plan.name === "Free" ? "Start for free" : `Get ${plan.name}`}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA bottom */}
      <section className="py-16 bg-[#1E2D45] text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to hear what your interviews are really saying?
          </h2>
          <Link
            to={isAuthenticated ? "/analyze" : "/auth/register"}
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition-colors text-sm"
          >
            Start Analyzing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#162035] text-white/50 py-6 text-sm text-center">
        {footerText}
      </footer>
    </div>
  );
}
