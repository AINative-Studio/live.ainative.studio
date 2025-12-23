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

const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  zap: Zap,
  layout: Layout,
  code: Code,
  cpu: Cpu,
  server: Server,
  link: LinkIcon,
  'gamepad-2': Gamepad2,
};

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || Code;

  return (
    <Link href={`/category/${category.slug}`}>
      <Card className="group overflow-hidden border-border hover:border-neon-blue transition-all duration-300 cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg bg-${category.color}/10 border border-${category.color}/20 group-hover:border-neon-blue transition-colors`}>
              <Icon className={`w-6 h-6 text-${category.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-mono font-semibold text-lg group-hover:text-neon-blue transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {category.description}
              </p>
              {category.viewerCount > 0 && (
                <Badge variant="secondary" className="mt-3 font-mono text-xs">
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
