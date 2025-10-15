'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { VolunteerGrid, VolunteerFilter, SignupForm } from '@/components/volunteer';
import {
  VolunteerOpportunity,
  VolunteerFilters,
  VolunteerCampus,
  DateFilter,
} from '@/types/volunteer.types';
import {
  filterOpportunitiesByDateRange,
  sortOpportunitiesByDate,
} from '@/lib/volunteer-utils';
import { signupForOpportunity, getCurrentUser } from './actions';

interface VolunteerClientWrapperProps {
  opportunities: VolunteerOpportunity[];
}

export function VolunteerClientWrapper({
  opportunities,
}: VolunteerClientWrapperProps) {
  const [filters, setFilters] = useState<VolunteerFilters>({
    campus: null,
    dateRange: 'upcoming',
  });
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<VolunteerOpportunity | null>(null);
  const [isSignupFormOpen, setIsSignupFormOpen] = useState(false);

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = [...opportunities];

    // Filter by campus
    if (filters.campus && filters.campus !== 'all') {
      filtered = filtered.filter((opp) => {
        return opp.campus === filters.campus || opp.campus === 'all';
      });
    }

    // Filter by date range
    filtered = filterOpportunitiesByDateRange(filtered, filters.dateRange);

    // Sort by date
    return sortOpportunitiesByDate(filtered);
  }, [opportunities, filters]);

  const handleSignupClick = async (opportunity: VolunteerOpportunity) => {
    // Check if user is authenticated
    const user = await getCurrentUser();

    if (!user) {
      toast.error('Please log in to sign up for volunteer opportunities', {
        action: {
          label: 'Log In',
          onClick: () => {
            window.location.href = '/auth/login?redirectTo=/volunteer';
          },
        },
      });
      return;
    }

    // Check if opportunity is in the past
    const oppDate = new Date(opportunity.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (oppDate < today) {
      toast.error('This opportunity has already passed');
      return;
    }

    // Check if opportunity is full
    if (opportunity.current_signups >= opportunity.max_volunteers) {
      toast.error('This opportunity is fully booked');
      return;
    }

    setSelectedOpportunity(opportunity);
    setIsSignupFormOpen(true);
  };

  const handleSignupSubmit = async (
    opportunityId: string,
    notes: string
  ): Promise<void> => {
    const result = await signupForOpportunity(opportunityId, notes);

    if (!result.success) {
      throw new Error(result.error || 'Failed to sign up');
    }
  };

  const handleSignupSuccess = () => {
    toast.success('Successfully signed up for volunteer opportunity!', {
      description: 'Check "My Shifts" to view your upcoming commitments.',
      action: {
        label: 'View My Shifts',
        onClick: () => {
          window.location.href = '/volunteer/my-shifts';
        },
      },
    });
    setIsSignupFormOpen(false);
    setSelectedOpportunity(null);

    // Refresh the page to show updated signup counts
    window.location.reload();
  };

  const handleFilterChange = (newFilters: VolunteerFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-8">
      {/* Filter Section */}
      <VolunteerFilter filters={filters} onFilterChange={handleFilterChange} />

      {/* Opportunities Grid */}
      {filteredOpportunities.length > 0 ? (
        <VolunteerGrid
          opportunities={filteredOpportunities}
          onSignUp={handleSignupClick}
          columns={3}
        />
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground text-lg mb-2">
            No volunteer opportunities found
          </p>
          <p className="text-muted-foreground text-sm">
            Try adjusting your filters or check back later for new opportunities.
          </p>
        </div>
      )}

      {/* Signup Form Modal */}
      {selectedOpportunity && (
        <SignupForm
          opportunity={selectedOpportunity}
          isOpen={isSignupFormOpen}
          onClose={() => {
            setIsSignupFormOpen(false);
            setSelectedOpportunity(null);
          }}
          onSuccess={handleSignupSuccess}
          onSubmit={handleSignupSubmit}
        />
      )}
    </div>
  );
}
