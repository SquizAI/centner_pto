import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - Centner Academy PTO',
  description: 'Terms of Service for MICA PTO, Co. website and services',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted/30 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary text-white">
            <FileText className="w-4 h-4 mr-2" />
            Legal Information
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="prose prose-slate max-w-none pt-6">
            <h2>1. About MICA PTO, Co.</h2>
            <p>
              MICA PTO, Co. (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is a 501(c)(3) nonprofit organization dedicated to
              supporting Centner Academy students, families, and staff. By accessing or using our website, you agree to be bound
              by these Terms of Service.
            </p>

            <h2>2. Use of Website</h2>
            <p>
              You may use our website for lawful purposes only. You agree not to use our website:
            </p>
            <ul>
              <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
              <li>To impersonate or attempt to impersonate MICA PTO, Co., a MICA PTO, Co. employee, another user, or any other person or entity</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
            </ul>

            <h2>3. Donations and Payments</h2>
            <p>
              All donations to MICA PTO, Co. are processed securely through third-party payment processors. By making a donation, you agree to:
            </p>
            <ul>
              <li>Provide accurate and complete payment information</li>
              <li>Acknowledge that all donations are final and non-refundable unless required by law</li>
              <li>Understand that MICA PTO, Co. is a 501(c)(3) nonprofit organization and donations are tax-deductible as permitted by law</li>
            </ul>
            <p className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <strong>Tax-Deductible Donations:</strong> All donations to MICA PTO, Co. are considered charitable contributions
              and tax-deductible, as no goods or services were exchanged for this donation. You will receive a receipt for tax purposes.
            </p>

            <h2>4. User Accounts</h2>
            <p>
              If you create an account on our website, you are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account and password</li>
              <li>Restricting access to your computer and account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>

            <h2>5. Intellectual Property</h2>
            <p>
              The website and its original content, features, and functionality are owned by MICA PTO, Co. and are protected by
              international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h2>6. Event Registration and Volunteering</h2>
            <p>
              When you register for events or sign up to volunteer:
            </p>
            <ul>
              <li>You commit to attending the event or volunteering as scheduled</li>
              <li>You agree to follow all safety guidelines and instructions provided by event organizers</li>
              <li>You understand that event details may change, and MICA PTO, Co. will make reasonable efforts to notify you of any changes</li>
            </ul>

            <h2>7. Privacy</h2>
            <p>
              Your use of our website is also governed by our{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              . Please review our Privacy Policy to understand our practices.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              MICA PTO, Co. shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from
              your use of or inability to use the website.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by
              posting the new Terms of Service on this page and updating the &quot;Last updated&quot; date.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:info@centnerpto.org" className="text-primary hover:underline">
                info@centnerpto.org
              </a>
            </p>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-0">
                <strong>MICA PTO, Co.</strong> is a 501(c)(3) nonprofit organization dedicated to supporting the
                Centner Academy community. Your support helps us create amazing opportunities for our students.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
