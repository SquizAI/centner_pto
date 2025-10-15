'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Sign up for a volunteer opportunity
 */
export async function signupForOpportunity(
  opportunityId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to sign up for volunteer opportunities',
      };
    }

    // Check if user has already signed up for this opportunity
    const { data: existingSignup } = await supabase
      .from('volunteer_signups')
      .select('id, status')
      .eq('opportunity_id', opportunityId)
      .eq('user_id', user.id)
      .single();

    if (existingSignup) {
      if (existingSignup.status === 'confirmed') {
        return {
          success: false,
          error: 'You have already signed up for this opportunity',
        };
      }
    }

    // Check if opportunity is full using the helper function
    const { data: isFull, error: fullCheckError } = await supabase.rpc(
      'is_opportunity_full',
      {
        opportunity_uuid: opportunityId,
      }
    );

    if (fullCheckError) {
      console.error('Error checking if opportunity is full:', fullCheckError);
      return {
        success: false,
        error: 'Failed to verify opportunity availability',
      };
    }

    if (isFull) {
      return {
        success: false,
        error: 'This opportunity is already fully booked',
      };
    }

    // Create signup
    const { error: insertError } = await supabase
      .from('volunteer_signups')
      .insert({
        opportunity_id: opportunityId,
        user_id: user.id,
        notes: notes || null,
        status: 'confirmed',
      });

    if (insertError) {
      console.error('Error creating signup:', insertError);
      return {
        success: false,
        error: 'Failed to sign up. Please try again.',
      };
    }

    // Revalidate pages to show updated data
    revalidatePath('/volunteer');
    revalidatePath('/volunteer/my-shifts');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in signupForOpportunity:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Cancel a volunteer signup
 */
export async function cancelSignup(
  signupId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to cancel a signup',
      };
    }

    // Update signup status to cancelled
    // RLS policy ensures user can only update their own signups
    const { error: updateError } = await supabase
      .from('volunteer_signups')
      .update({ status: 'cancelled' })
      .eq('id', signupId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error cancelling signup:', updateError);
      return {
        success: false,
        error: 'Failed to cancel signup. Please try again.',
      };
    }

    // Revalidate pages to show updated data
    revalidatePath('/volunteer');
    revalidatePath('/volunteer/my-shifts');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in cancelSignup:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
