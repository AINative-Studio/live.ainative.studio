import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about AINative Studio Live - the livestreaming platform built for developers who want to share their AI-native workflows, collaborate in real-time, and build in public.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About | AINative Studio Live',
    description:
      'Learn about AINative Studio Live - the livestreaming platform built for developers who want to share their AI-native workflows.',
    url: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
              About <span className="text-brand-primary">AINative Studio Live</span>
            </h1>
            <p className="text-xl text-muted-foreground text-center mb-12">
              Live coding streams for AI-native developers
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                AINative Studio Live exists to accelerate the future of AI-native software development by enabling
                developers to share their AI-enhanced workflows, learn from each other, and build amazing things
                in public. We believe that transparency, collaboration, and AI augmentation will
                define the next era of software engineering.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Why We Built This</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Traditional streaming platforms weren't designed for developers. We needed a space
                that understands:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary font-mono">→</span>
                  <span>The unique needs of IDE streaming and code-focused content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary font-mono">→</span>
                  <span>AI-native workflows and multi-agent development patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary font-mono">→</span>
                  <span>Technical discussions and collaborative problem-solving</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary font-mono">→</span>
                  <span>The developer community and its specific culture</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">What Makes Us Different</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="text-xl font-semibold mb-2">Developer-First Design</h3>
                  <p className="text-muted-foreground">
                    Every feature is built with developers in mind, from code syntax highlighting in
                    chat to specialized categories for different tech stacks.
                  </p>
                </div>

                <div className="border-l-4 border-secondary pl-4">
                  <h3 className="text-xl font-semibold mb-2">Focus on Learning</h3>
                  <p className="text-muted-foreground">
                    Not just entertainment - we're building a knowledge-sharing platform where
                    developers teach and learn from each other in real-time.
                  </p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="text-xl font-semibold mb-2">AI-Native Features</h3>
                  <p className="text-muted-foreground">
                    Built for the era of AI-assisted development with features that showcase and
                    celebrate AI-native development workflows.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
                  <p className="text-muted-foreground">
                    Your feedback shapes the platform. We're building this together with the
                    developer community.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Built by AINative Studio</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                AINative Studio Live is crafted by AINative Studio, a team passionate about the intersection
                of AI and software development. We're developers building for developers, and we're
                just getting started.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-t from-background to-card">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Join the Movement</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be part of the future of AI-native software development. Stream your sessions, learn from
              others, and help build the developer community.
            </p>
            <Button size="lg" className="font-mono text-lg bg-brand-primary hover:bg-primary-dark" asChild>
              <Link href="/dashboard">
                Start Streaming Today <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
