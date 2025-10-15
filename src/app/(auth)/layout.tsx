import { getCurrentUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Redirect authenticated users away from auth pages
  const user = await getCurrentUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-white to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="https://centneracademy.com/wp-content/uploads/2021/02/logo-centner.png"
              alt="Centner Academy"
              width={200}
              height={80}
              priority
              className="h-16 w-auto"
            />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">Parent-Teacher Organization</h1>
            <p className="text-sm text-muted-foreground">
              Supporting excellence in education
            </p>
          </div>
        </div>

        {/* Auth Form */}
        {children}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
