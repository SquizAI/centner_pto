'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// UUID validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Sign up for a volunteer opportunity
 */
export async function signupForOpportunity(
  opportunityId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate UUID format
    if (!UUID_REGEX.test(opportunityId)) {
      return {
        success: false,
        error: 'Invalid opportunity ID format',
      };
    }

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

    // Create signup - the database trigger will handle capacity checking atomically
    // This prevents race conditions by letting the database enforce constraints
    const { error: insertError } = await supabase
      .from('volunteer_signups')
      .insert({
        opportunity_id: opportunityId,
        user_id: user.id,
        notes: notes || null,
        status: 'confirmed',
      });

    if (insertError) {
      // Check if it's a capacity error from the database trigger
      if (
        insertError.message.includes('full') ||
        insertError.message.includes('exceed') ||
        insertError.message.includes('capacity')
      ) {
        return {
          success: false,
          error: 'This opportunity just filled up. Please try another one.',
        };
      }

      // Check if it's the unique constraint (user already signed up)
      if (
        insertError.message.includes('unique') ||
        insertError.code === '23505'
      ) {
        return {
          success: false,
          error: 'You have already signed up for this opportunity.',
        };
      }

      // Log server-side only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating signup:', insertError);
      }

      return {
        success: false,
        error: 'Failed to sign up. Please try again.',
      };
    }

    // Verify the signup was created with correct user_id (defense in depth)
    const { data: verifySignup } = await supabase
      .from('volunteer_signups')
      .select('user_id')
      .eq('opportunity_id', opportunityId)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .single();

    if (!verifySignup || verifySignup.user_id !== user.id) {
      // This should never happen with proper RLS, but defense in depth
      if (process.env.NODE_ENV === 'development') {
        console.error('Authorization verification failed after signup');
      }
      return {
        success: false,
        error: 'Signup verification failed. Please contact support.',
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
    // Validate UUID format
    if (!UUID_REGEX.test(signupId)) {
      return {
        success: false,
        error: 'Invalid signup ID format',
      };
    }

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
