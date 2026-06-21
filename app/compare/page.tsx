import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ArrowRight, Code2, Monitor, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Compare Developer Streaming Platforms',
  description:
    'See how AINative Studio Live compares to Twitch, YouTube, and Kick for developer live coding streams.',
  alternates: {
    canonical: 'https://live.ainative.studio/compare',
  },
  openGraph: {
    title: 'Compare Developer Streaming Platforms | AINative Studio Live',
    description:
      'See how AINative Studio Live compares to Twitch, YouTube, and Kick for developer live coding streams.',
    url: 'https://live.ainative.studio/compare',
  },
};

const comparisons = [
  {
    platform: 'Twitch',
    slug: 'twitch',
    tagline: 'Built for developers, not gamers',
    description:
      'Twitch dominates gaming streams, but developers need code-aware tooling, AI assistants, and tech-stack discovery — none of which Twitch offers.',
    icon: Monitor,
    highlights: [
      'Code-aware streams with GitHub integration',
      'AI chat assistant vs no developer tools',
      'Browse by language and framework',
    ],
  },
  {
    platform: 'YouTube',
    slug: 'youtube',
    tagline: 'Live coding deserves a live-first platform',
    description:
      'YouTube excels at on-demand video, but its live coding experience lacks real-time interactivity, developer tooling, and community focus.',
    icon: Code2,
    highlights: [
      'Purpose-built for live coding sessions',
      'WebRTC browser streaming included',
      'Auto-generated blog posts and code snippets',
    ],
  },
];

export default function ComparePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-secondary/5" />
          <div className="container mx-auto px-4 py-20 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Platform Comparison
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Compare Developer Streaming Platforms
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                General-purpose streaming platforms were built for gaming and entertainment.
                AINative Studio Live is the only platform purpose-built for developers who
                code live, build in public, and ship AI-native projects.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Cards */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {comparisons.map((comp) => {
              const Icon = comp.icon;
              return (
                <Link
                  key={comp.slug}
                  href={`/compare/${comp.slug}`}
                  className="group block border border-border rounded-xl p-8 hover:border-brand-primary/50 transition-all hover:shadow-lg hover:shadow-brand-primary/5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        AINative vs {comp.platform}
                      </h2>
                      <p className="text-sm text-muted-foreground">{comp.tagline}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6">{comp.description}</p>
                  <ul className="space-y-2 mb-6">
                    {comp.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-brand-primary mt-0.5">&#10003;</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1 text-brand-primary font-medium text-sm group-hover:gap-2 transition-all">
                    Read full comparison
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Why AINative Section */}
          <div className="max-w-3xl mx-auto mt-20 text-center">
            <h2 className="text-2xl font-bold mb-6">
              Why Developers Choose AINative Studio Live
            </h2>
            <div className="grid sm:grid-cols-3 gap-8 text-left">
              <div>
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                  <Code2 className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Code-First Design</h3>
                <p className="text-sm text-muted-foreground">
                  Every feature — from stream setup to discovery — is designed
                  around how developers actually work. Link your GitHub repo,
                  tag your tech stack, and let viewers browse by language.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="font-semibold mb-2">AI-Native Tooling</h3>
                <p className="text-sm text-muted-foreground">
                  An AI assistant lives in every chat. Viewers ask questions, get
                  code explanations, and receive real-time summaries — all without
                  disrupting the streamer.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <Monitor className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Content Pipeline</h3>
                <p className="text-sm text-muted-foreground">
                  Your streams automatically generate blog drafts, code snippets,
                  and transcripts. Turn a 2-hour coding session into a week of
                  content — zero extra work.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
