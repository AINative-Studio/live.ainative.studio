import Link from 'next/link';
import { Github, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/ainative-icon.svg" alt="AINative Studio Live" className="h-8 w-auto" />
              <span className="font-mono text-lg font-bold">
                AINative<span className="text-primary">Live</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Live coding streams for AI-native developers. Stream Your IDE. Build in Public.
            </p>
          </div>

          <div>
            <h3 className="font-mono font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/vibe-coding" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  What is AI-Native Development?
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Start Streaming
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono font-semibold mb-4">Browse</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/category/ai-coding" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  AI Coding
                </Link>
              </li>
              <li>
                <Link href="/category/ai-native-development" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  AI-Native Development
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Search Streams
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-secondary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground font-mono">
            &copy; {new Date().getFullYear()} AINative Studio Live. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
