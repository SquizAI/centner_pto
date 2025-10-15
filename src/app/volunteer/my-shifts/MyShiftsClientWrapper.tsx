'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MyVolunteerShifts } from '@/components/volunteer';
import { createClient } from '@/lib/supabase/client';
import { cancelSignup } from '../actions';

interface VolunteerShift {
  id: string;
  opportunity_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  campus: string;
  notes: string | null;
  status: string;
}

interface MyShiftsClientWrapperProps {
  userId: string;
}

export function MyShiftsClientWrapper({ userId }: MyShiftsClientWrapperProps) {
  const [shifts, setShifts] = useState<VolunteerShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserShifts();
  }, [userId]);

  const fetchUserShifts = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      // Fetch user's signups with opportunity details using the helper function
      const { data, error } = await supabase.rpc(
        'get_user_upcoming_commitments',
        {
          user_uuid: userId,
        }
      );

      if (error) {
        console.error('Error fetching user shifts:', error);
        toast.error('Failed to load your volunteer shifts');
        setShifts([]); // Set empty array on error
        setIsLoading(false); // MUST set loading to false
        return;
      }

      // Transform the data to match the expected format
      const formattedShifts: VolunteerShift[] = (data || []).map(
        (item: any) => ({
          id: item.signup_id,
          opportunity_id: item.opportunity_id,
          title: item.title,
          date: item.date,
          start_time: item.start_time,
          end_time: item.end_time,
          location: item.location,
          campus: item.campus,
          notes: item.signup_notes,
          status: item.signup_status,
        })
      );

      setShifts(formattedShifts);
    } catch (error) {
      console.error('Error in fetchUserShifts:', error);
      toast.error('An error occurred while loading your shifts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSignup = async (signupId: string): Promise<void> => {
    const result = await cancelSignup(signupId);

    if (!result.success) {
      toast.error(result.error || 'Failed to cancel signup');
      throw new Error(result.error || 'Failed to cancel signup');
    }

    toast.success('Volunteer signup cancelled successfully');

    // Refresh the shifts list
    await fetchUserShifts();
  };

  return (
    <MyVolunteerShifts
      shifts={shifts}
      isLoading={isLoading}
      onCancelSignup={handleCancelSignup}
    />
  );
}
