import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Check, X, ArrowRight, TrendingDown, Code2, Zap, Users, Radio } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AINative Studio Live vs Twitch for Developer Streaming',
  description:
    'Compare AINative Studio Live and Twitch for developer live coding. See why developers are switching to a platform built for code, not gaming.',
  keywords: [
    'twitch for developers',
    'twitch alternative for coding',
    'developer streaming platform',
    'live coding twitch',
    'programming stream platform',
  ],
  alternates: {
    canonical: 'https://live.ainative.studio/compare/twitch',
  },
  openGraph: {
    title: 'AINative Studio Live vs Twitch for Developer Streaming',
    description:
      'Compare AINative Studio Live and Twitch for developer live coding streams. Code-aware features, AI chat, and tech-stack discovery vs a gaming platform.',
    url: 'https://live.ainative.studio/compare/twitch',
  },
};

const features = [
  {
    feature: 'Built for developers',
    ainative: true,
    ainativeDetail: 'Every feature designed for live coding workflows',
    twitch: false,
    twitchDetail: 'Gaming-first platform; coding is an afterthought',
  },
  {
    feature: 'Code-aware streams',
    ainative: true,
    ainativeDetail: 'GitHub repo linking, language badges, tech-stack tags',
    twitch: false,
    twitchDetail: 'No source code integration of any kind',
  },
  {
    feature: 'AI chat assistant',
    ainative: true,
    ainativeDetail: '@ai in chat for code explanations and Q&A',
    twitch: false,
    twitchDetail: 'No built-in AI features for viewers or streamers',
  },
  {
    feature: 'Browser streaming',
    ainative: true,
    ainativeDetail: 'WebRTC/WHIP — stream directly from your browser',
    twitch: false,
    twitchDetail: 'Requires OBS or third-party software to go live',
  },
  {
    feature: 'Tech-stack discovery',
    ainative: true,
    ainativeDetail: 'Browse streams by language, framework, or tool',
    twitch: false,
    twitchDetail: 'Single "Software and Game Development" category',
  },
  {
    feature: 'Content pipeline',
    ainative: true,
    ainativeDetail: 'Auto-generate blog posts, code snippets, transcripts',
    twitch: false,
    twitchDetail: 'No content repurposing tools',
  },
  {
    feature: 'AI stream summaries',
    ainative: true,
    ainativeDetail: 'Real-time summaries so late joiners catch up instantly',
    twitch: false,
    twitchDetail: 'Viewers must watch from the start or guess context',
  },
  {
    feature: 'VOD chapters',
    ainative: true,
    ainativeDetail: 'AI-generated chapters for navigating past streams',
    twitch: false,
    twitchDetail: 'Basic VOD with no chapter navigation',
  },
  {
    feature: 'OBS / RTMP support',
    ainative: true,
    ainativeDetail: 'Full RTMP ingest for professional setups',
    twitch: true,
    twitchDetail: 'Industry-standard RTMP streaming',
  },
  {
    feature: 'Large existing audience',
    ainative: false,
    ainativeDetail: 'Growing developer community',
    twitch: true,
    twitchDetail: '31M daily active users (primarily gaming)',
  },
  {
    feature: 'Monetization',
    ainative: 'soon',
    ainativeDetail: 'Revenue sharing coming soon',
    twitch: true,
    twitchDetail: '50/50 revenue split for most affiliates',
  },
  {
    feature: 'Clip creation',
    ainative: true,
    ainativeDetail: 'Create clips from live streams and VODs',
    twitch: true,
    twitchDetail: 'Clip system with sharing',
  },
];

function FeatureCheck({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="w-5 h-5 text-emerald-500" />;
  }
  if (value === 'soon') {
    return <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Soon</span>;
  }
  return <X className="w-5 h-5 text-red-400/60" />;
}

export default function CompareTwitchPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-purple-500/5" />
          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Link
                href="/compare"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-primary mb-6 transition-colors"
              >
                &larr; All comparisons
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                AINative Studio Live vs Twitch
                <br />
                <span className="text-brand-primary">for Developer Streaming</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Twitch built a powerhouse for gaming. But if you stream code, build AI
                projects, or do live development — you deserve a platform designed for
                exactly that. Here is how AINative Studio Live compares.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-medium transition-colors"
                >
                  Start Streaming Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard/go-live"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-brand-primary/50 font-medium transition-colors"
                >
                  <Radio className="w-4 h-4" />
                  Go Live Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">
            Feature-by-Feature Comparison
          </h2>
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 min-w-[180px]">
                    <div className="flex items-center justify-center gap-2">
                      <img
                        src="/ainative-icon.svg"
                        alt="AINative"
                        className="h-5 w-auto"
                      />
                      <span className="font-bold">AINative Studio</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 min-w-[180px]">
                    <span className="font-bold text-purple-400">Twitch</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium">{row.feature}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <FeatureCheck value={row.ainative} />
                        <span className="text-xs text-muted-foreground max-w-[160px]">
                          {row.ainativeDetail}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <FeatureCheck value={row.twitch} />
                        <span className="text-xs text-muted-foreground max-w-[160px]">
                          {row.twitchDetail}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Why Developers Are Leaving Twitch */}
        <section className="border-y border-border bg-muted/20">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold">
                  Why Developers Are Leaving Twitch
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Twitch&apos;s &quot;Software and Game Development&quot; category has seen a{' '}
                  <strong className="text-foreground">16% decline</strong> in average
                  concurrent viewers over the past year. The reason is simple: developers
                  are underserved on a platform optimized for gaming entertainment.
                </p>
                <p>
                  When a viewer searches for &quot;TypeScript streams&quot; on Twitch, they get
                  nothing. There is no way to filter by programming language, framework,
                  or project type. Every coding stream is lumped into one massive
                  category alongside game mod developers and 3D artists.
                </p>
                <p>
                  Discoverability is the core problem. On Twitch, a developer streaming
                  to 15 viewers is buried under thousands of gaming channels. The
                  algorithm rewards watch time and viewer count — metrics that favor
                  entertainment content over educational, niche, or technical streams.
                </p>
                <p>
                  Developers also need tools that Twitch was never designed to provide.
                  Code-aware features like GitHub repository linking, language badges on
                  stream thumbnails, and AI-powered chat assistants that can explain
                  code to viewers in real time. These are not nice-to-haves — they are
                  fundamental to the developer streaming experience.
                </p>
                <p>
                  The content pipeline problem is equally significant. A developer who
                  streams for 3 hours on Twitch walks away with a VOD that will be
                  deleted in 14 days (60 days for Partners). On AINative Studio Live,
                  that same stream automatically generates a blog draft, extractable
                  code snippets, a full transcript, and AI-generated chapter markers
                  for easy navigation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Advantages */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">
            What AINative Studio Live Does Differently
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                Tech-Stack Discovery
              </h3>
              <p className="text-muted-foreground text-sm">
                Viewers browse streams by the exact technology they care about.
                Looking for someone building with Next.js and Tailwind? Filter by
                framework. Want to watch a Rust systems project? Browse the Rust
                category. Every stream is tagged with its tech stack, GitHub
                repository, and primary languages — making discovery effortless.
              </p>
            </div>
            <div className="border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                AI-Powered Chat
              </h3>
              <p className="text-muted-foreground text-sm">
                Every stream includes an AI assistant that viewers can invoke with
                @ai in chat. Ask it to explain what the streamer just coded, get a
                summary of the last 30 minutes, or understand a complex algorithm.
                The AI understands the stream context and provides relevant,
                code-aware responses without interrupting the streamer.
              </p>
            </div>
            <div className="border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Radio className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                Zero-Setup Browser Streaming
              </h3>
              <p className="text-muted-foreground text-sm">
                Go live in under 30 seconds. AINative Studio Live includes
                WebRTC/WHIP browser streaming — no OBS download, no RTMP
                configuration, no encoding settings. Click &quot;Go Live,&quot; share your
                screen, and start coding. For advanced users, full RTMP ingest is
                also available for OBS and other professional tools.
              </p>
            </div>
            <div className="border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                Developer-First Community
              </h3>
              <p className="text-muted-foreground text-sm">
                On Twitch, a 20-viewer coding stream feels empty. On AINative
                Studio Live, 20 engaged developers watching you build a real
                project is the norm. The entire community is here for code — no
                gaming noise, no algorithm fighting, just developers learning and
                building together.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Start Streaming on AINative Studio Live
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Free to use. No OBS required. Go live from your browser in under
                30 seconds and reach an audience that actually cares about code.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-lg transition-colors"
              >
                Create Your Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required. Start streaming immediately.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
