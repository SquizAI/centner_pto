import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // email, recovery, invite, magiclink
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the user's profile to create if needed
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        // Create profile if it doesn't exist (for OAuth users or email confirmation)
        if (!profile) {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata.full_name || user.user_metadata.name || null,
            role: 'member',
          })
        }
      }

      // Determine redirect based on type
      let redirectUrl = next

      // If this is an email confirmation, show success message then redirect to dashboard
      if (type === 'signup' || type === 'email') {
        redirectUrl = '/success?type=email-verified&redirect=/dashboard'
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      }
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
