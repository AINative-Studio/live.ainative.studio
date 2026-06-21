import type { Metadata } from 'next';
import { findTechBySlug } from '@/lib/tech-stack';
import TechSlugClient from './tech-slug-client';

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const tech = findTechBySlug(params.slug);
  const name = tech?.name || params.slug;
  const title = `${name} Streams`;
  const description = `Watch live ${name} developer streams on AINative Studio Live. Find developers coding with ${name} in real time.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/tech/${params.slug}`,
    },
    openGraph: {
      title: `${title} | AINative Studio Live`,
      description,
      url: `/tech/${params.slug}`,
    },
  };
}

export default function TechSlugPage() {
  return <TechSlugClient />;
}
