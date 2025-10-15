import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MyShiftsClientWrapper } from './MyShiftsClientWrapper';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Volunteer Shifts | Centner Academy PTO',
  description:
    'View and manage your volunteer commitments at Centner Academy.',
};

// Revalidate every 2 minutes for user-specific data
export const revalidate = 120;

export default async function MyShiftsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Redirect to login with return URL
    redirect('/auth/login?redirectTo=/volunteer/my-shifts');
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <header className="mb-8">
        <Link href="/volunteer">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Opportunities
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">My Volunteer Shifts</h1>
        </div>

        <p className="text-muted-foreground text-lg">
          View and manage your upcoming volunteer commitments
        </p>
      </header>

      {/* My Volunteer Shifts Component */}
      <section>
        <MyShiftsClientWrapper userId={user.id} />
      </section>

      {/* Browse More Section */}
      <section className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/10 text-center">
        <h2 className="text-xl font-semibold mb-2">
          Looking for More Ways to Help?
        </h2>
        <p className="text-muted-foreground mb-4">
          Browse available volunteer opportunities and sign up for shifts that
          work with your schedule.
        </p>
        <Link href="/volunteer">
          <Button>Browse Opportunities</Button>
        </Link>
      </section>
    </div>
  );
}
