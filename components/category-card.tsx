import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Zap,
  Layout,
  Code,
  Cpu,
  Server,
  Link as LinkIcon,
  Gamepad2,
  LucideIcon
} from 'lucide-react';
import type { Category } from '@/types';

// Map category slugs to icons (fallback for categories without iconUrl)
const iconMap: Record<string, LucideIcon> = {
  'ai-ml': Brain,
  'machine-learning': Brain,
  'deep-learning': Brain,
  'web-dev': Layout,
  'web-development': Layout,
  'frontend': Code,
  'backend': Server,
  'devops': Cpu,
  'cloud': Zap,
  'blockchain': LinkIcon,
  'game-dev': Gamepad2,
  'gaming': Gamepad2,
};

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  // Use iconUrl if available, otherwise fall back to slug-based icon mapping
  const Icon = iconMap[category.slug] || Code;

  return (
    <Link href={`/category/${category.slug}`}>
      <Card className="group overflow-hidden border-border hover:border-primary transition-all duration-300 cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary transition-colors">
              {category.iconUrl ? (
                <img src={category.iconUrl} alt={category.name} className="w-6 h-6" />
              ) : (
                <Icon className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {category.description}
              </p>
              {category.viewerCount > 0 && (
                <Badge variant="secondary" className="mt-3 font-medium text-xs">
                  {category.viewerCount.toLocaleString()} watching
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
