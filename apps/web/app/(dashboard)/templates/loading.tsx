import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function TemplatesLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-60" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Search skeleton */}
      <Skeleton className="h-10 w-full" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              {/* Title */}
              <Skeleton className="h-6 w-3/4" />

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              {/* Tags */}
              <div className="flex gap-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-14" />
              </div>

              {/* Date */}
              <Skeleton className="h-3 w-32" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
