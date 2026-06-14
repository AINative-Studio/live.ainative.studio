/**
 * Tech stack definitions for language and framework discovery.
 *
 * Tags use a prefix convention:
 *   lang:<slug>   for programming languages
 *   fw:<slug>     for frameworks / libraries
 */

export interface TechItem {
  name: string;
  slug: string;
  tag: string; // the prefixed tag value, e.g. "lang:typescript"
}

export const LANGUAGES: TechItem[] = [
  { name: 'JavaScript', slug: 'javascript', tag: 'lang:javascript' },
  { name: 'TypeScript', slug: 'typescript', tag: 'lang:typescript' },
  { name: 'Python', slug: 'python', tag: 'lang:python' },
  { name: 'Rust', slug: 'rust', tag: 'lang:rust' },
  { name: 'Go', slug: 'go', tag: 'lang:go' },
  { name: 'Java', slug: 'java', tag: 'lang:java' },
  { name: 'C++', slug: 'cpp', tag: 'lang:cpp' },
  { name: 'C#', slug: 'csharp', tag: 'lang:csharp' },
  { name: 'Ruby', slug: 'ruby', tag: 'lang:ruby' },
  { name: 'PHP', slug: 'php', tag: 'lang:php' },
  { name: 'Swift', slug: 'swift', tag: 'lang:swift' },
  { name: 'Kotlin', slug: 'kotlin', tag: 'lang:kotlin' },
  { name: 'Dart', slug: 'dart', tag: 'lang:dart' },
  { name: 'Elixir', slug: 'elixir', tag: 'lang:elixir' },
  { name: 'Haskell', slug: 'haskell', tag: 'lang:haskell' },
  { name: 'Scala', slug: 'scala', tag: 'lang:scala' },
  { name: 'R', slug: 'r', tag: 'lang:r' },
  { name: 'SQL', slug: 'sql', tag: 'lang:sql' },
];

export const FRAMEWORKS: TechItem[] = [
  { name: 'React', slug: 'react', tag: 'fw:react' },
  { name: 'Next.js', slug: 'nextjs', tag: 'fw:nextjs' },
  { name: 'Vue', slug: 'vue', tag: 'fw:vue' },
  { name: 'Angular', slug: 'angular', tag: 'fw:angular' },
  { name: 'Svelte', slug: 'svelte', tag: 'fw:svelte' },
  { name: 'Django', slug: 'django', tag: 'fw:django' },
  { name: 'FastAPI', slug: 'fastapi', tag: 'fw:fastapi' },
  { name: 'Flask', slug: 'flask', tag: 'fw:flask' },
  { name: 'Rails', slug: 'rails', tag: 'fw:rails' },
  { name: 'Spring', slug: 'spring', tag: 'fw:spring' },
  { name: '.NET', slug: 'dotnet', tag: 'fw:dotnet' },
  { name: 'Express', slug: 'express', tag: 'fw:express' },
  { name: 'NestJS', slug: 'nestjs', tag: 'fw:nestjs' },
  { name: 'Laravel', slug: 'laravel', tag: 'fw:laravel' },
  { name: 'Flutter', slug: 'flutter', tag: 'fw:flutter' },
  { name: 'React Native', slug: 'react-native', tag: 'fw:react-native' },
];

export const ALL_TECH = [...LANGUAGES, ...FRAMEWORKS];

/** Find a tech item by its slug (used in URL routes). */
export function findTechBySlug(slug: string): TechItem | undefined {
  return ALL_TECH.find((t) => t.slug === slug);
}

/** Check whether a tag string is a tech-stack tag. */
export function isTechTag(tag: string): boolean {
  return tag.startsWith('lang:') || tag.startsWith('fw:');
}

/** Extract display name from a tech tag, e.g. "lang:typescript" -> "TypeScript". */
export function techTagDisplayName(tag: string): string | null {
  const item = ALL_TECH.find((t) => t.tag === tag);
  return item?.name ?? null;
}

/** Get the slug for a tech tag (for linking to /tech/[slug]). */
export function techTagSlug(tag: string): string | null {
  const item = ALL_TECH.find((t) => t.tag === tag);
  return item?.slug ?? null;
}

/** Determine whether a tag is a language or framework. */
export function techTagType(tag: string): 'language' | 'framework' | null {
  if (tag.startsWith('lang:')) return 'language';
  if (tag.startsWith('fw:')) return 'framework';
  return null;
}
