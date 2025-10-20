import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { VolunteerOpportunity } from '@/types/volunteer.types';
import { VolunteerClientWrapper } from './VolunteerClientWrapper';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Volunteer Opportunities | Centner Academy PTO',
  description:
    'Join us in making a difference at Centner Academy. Browse and sign up for volunteer opportunities across all campuses.',
  openGraph: {
    title: 'Volunteer Opportunities | Centner Academy PTO',
    description:
      'Join us in making a difference at Centner Academy. Browse and sign up for volunteer opportunities across all campuses.',
    type: 'website',
  },
};

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

// Force dynamic rendering (required for cookies/server-side auth)
export const dynamic = 'force-dynamic';

async function getActiveOpportunities(): Promise<VolunteerOpportunity[]> {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];

  const { data: opportunities, error } = await supabase
    .from('volunteer_opportunities')
    .select('*')
    .eq('status', 'active')
    .gte('date', today)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching volunteer opportunities:', error);
    throw new Error('Failed to fetch volunteer opportunities');
  }

  return opportunities || [];
}

export default async function VolunteerPage() {
  try {
    const opportunities = await getActiveOpportunities();

    return (
      <div className="container mx-auto px-4 py-12">
        {/* Page Header / Hero Section */}
        <header className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Heart className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Volunteer Opportunities
          </h1>

          <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-8">
            Join us in making a difference at Centner Academy. Sign up for
            volunteer opportunities that match your interests and availability.
            Your time and dedication help create an amazing experience for our
            students and families.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              <span>
                <strong className="text-foreground">
                  {opportunities.length}
                </strong>{' '}
                Upcoming Opportunities
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5 text-primary" />
              <span>All campuses welcome</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/volunteer/my-shifts">
              <Button variant="outline" size="lg">
                View My Shifts
              </Button>
            </Link>
          </div>
        </header>

        {/* Opportunities Section */}
        <section>
          {opportunities.length > 0 ? (
            <VolunteerClientWrapper opportunities={opportunities} />
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-lg">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-muted p-6">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                No Opportunities Available
              </h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                There are no active volunteer opportunities at this time. Check
                back soon for new ways to get involved!
              </p>
              <p className="text-muted-foreground text-sm">
                Questions? Contact us at{' '}
                <a
                  href="mailto:volunteer@centneracademy.com"
                  className="text-primary hover:underline"
                >
                  volunteer@centneracademy.com
                </a>
              </p>
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="mt-16 p-8 bg-primary/5 rounded-lg border border-primary/10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Why Volunteer?</h2>
            <p className="text-muted-foreground mb-6">
              Volunteering at Centner Academy is a rewarding way to support our
              students and strengthen our school community. Whether you have a
              few hours to spare or can commit to regular shifts, your
              contribution makes a meaningful impact.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold mb-2">Make an Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Directly support student programs, events, and daily
                  activities
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Build Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with other parents, teachers, and staff members
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Flexible Options</h3>
                <p className="text-sm text-muted-foreground">
                  Choose opportunities that fit your schedule and interests
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Error in VolunteerPage:', error);
    // Re-throw to be caught by error boundary
    throw error;
  }
}
