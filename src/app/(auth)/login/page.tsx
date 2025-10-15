import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your Centner Academy PTO account',
}

export default function LoginPage() {
  return <LoginForm />
}
