import { cn } from '@/lib/utils';

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3776ab',
  rust: '#dea584',
  go: '#00add8',
  java: '#ed8b00',
  'c++': '#00599c',
  cpp: '#00599c',
  ruby: '#cc342d',
  php: '#777bb4',
  swift: '#fa7343',
  kotlin: '#7f52ff',
  csharp: '#239120',
  'c#': '#239120',
  dart: '#00b4ab',
  elixir: '#6e4a7e',
  scala: '#dc322f',
  haskell: '#5e5086',
  lua: '#000080',
  zig: '#f7a41d',
};

const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  'c++': 'C++',
  cpp: 'C++',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  csharp: 'C#',
  'c#': 'C#',
  dart: 'Dart',
  elixir: 'Elixir',
  scala: 'Scala',
  haskell: 'Haskell',
  lua: 'Lua',
  zig: 'Zig',
};

interface LanguageBadgeProps {
  language: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function LanguageBadge({ language, size = 'md', className }: LanguageBadgeProps) {
  const key = language.toLowerCase();
  const color = LANGUAGE_COLORS[key] || '#6b7280';
  const displayName = LANGUAGE_DISPLAY_NAMES[key] || language;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono',
        size === 'sm' ? 'text-[10px]' : 'text-xs',
        className,
      )}
    >
      <span
        className={cn(
          'rounded-full flex-shrink-0',
          size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5',
        )}
        style={{ backgroundColor: color }}
      />
      {displayName}
    </span>
  );
}

/**
 * Extract languages from stream tags.
 * Tags prefixed with "lang:" are treated as language tags.
 */
export function extractLanguages(tags: Array<{ name: string; slug?: string } | string>): string[] {
  return tags
    .map((tag) => {
      const name = typeof tag === 'string' ? tag : tag.name;
      if (name.toLowerCase().startsWith('lang:')) {
        return name.slice(5).trim();
      }
      return null;
    })
    .filter((lang): lang is string => lang !== null);
}

/**
 * Extract GitHub repo from stream tags.
 * Tags prefixed with "repo:" are treated as repo references (e.g. "repo:user/repo").
 */
export function extractGithubRepo(tags: Array<{ name: string; slug?: string } | string>): string | null {
  for (const tag of tags) {
    const name = typeof tag === 'string' ? tag : tag.name;
    if (name.toLowerCase().startsWith('repo:')) {
      return name.slice(5).trim();
    }
  }
  return null;
}
