import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryCardSkeleton() {
  return (
    <Card className="p-6 border-border">
      <div className="space-y-3">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  );
}
