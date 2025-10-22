import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { userId, firstName, lastName, grade, campus, dateOfBirth, allergies, medicalNotes } = body

    const { error } = await supabase.from('students').insert({
      parent_id: userId,
      first_name: firstName,
      last_name: lastName,
      grade,
      campus,
      date_of_birth: dateOfBirth || null,
      allergies: allergies || null,
      medical_notes: medicalNotes || null,
    })

    if (error) {
      console.error('Error creating student:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Student creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create student' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { studentId, firstName, lastName, grade, campus, dateOfBirth, allergies, medicalNotes } = body

    const { error } = await supabase
      .from('students')
      .update({
        first_name: firstName,
        last_name: lastName,
        grade,
        campus,
        date_of_birth: dateOfBirth || null,
        allergies: allergies || null,
        medical_notes: medicalNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId)

    if (error) {
      console.error('Error updating student:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Student update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update student' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { studentId } = body

    const { error } = await supabase
      .from('students')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', studentId)

    if (error) {
      console.error('Error deleting student:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Student deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}
