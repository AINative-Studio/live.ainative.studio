import type { Metadata } from 'next';
import CategoryClient from './category-client';
import categoriesData from '@/data/categories.json';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = (categoriesData as { id: string; name: string; slug: string; description: string }[]).find(
    (c) => c.slug === params.slug
  );

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: category.name,
    description: category.description,
    alternates: {
      canonical: `/category/${params.slug}`,
    },
    openGraph: {
      title: `${category.name} | AINative Studio Live`,
      description: category.description,
      url: `/category/${params.slug}`,
    },
  };
}

export default function CategoryPage({ params }: PageProps) {
  return <CategoryClient />;
}
