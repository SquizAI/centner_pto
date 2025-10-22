import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      userId,
      name,
      email,
      phone,
      isParent,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      emergencyContactName,
      emergencyContactPhone,
      preferredCommunication,
    } = body

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        phone,
        is_parent: isParent,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        zip_code: zipCode,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        preferred_communication: preferredCommunication,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
