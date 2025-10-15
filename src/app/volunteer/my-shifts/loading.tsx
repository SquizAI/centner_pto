import { MyVolunteerShiftSkeleton } from '@/components/volunteer';
import { Calendar } from 'lucide-react';

export default function MyShiftsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header Skeleton */}
      <header className="mb-8">
        <div className="h-9 w-48 bg-muted rounded-lg mb-4 animate-pulse" />

        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-muted p-3 animate-pulse">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="h-10 w-80 bg-muted rounded-lg animate-pulse" />
        </div>

        <div className="h-6 w-96 bg-muted rounded-lg animate-pulse" />
      </header>

      {/* Shifts Loading Skeleton */}
      <section className="space-y-4">
        <MyVolunteerShiftSkeleton />
        <MyVolunteerShiftSkeleton />
        <MyVolunteerShiftSkeleton />
      </section>
    </div>
  );
}
