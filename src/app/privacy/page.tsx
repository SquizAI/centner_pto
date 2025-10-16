import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Centner Academy PTO',
  description: 'Privacy Policy for MICA PTO, Co. website and services',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted/30 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary text-white">
            <Shield className="w-4 h-4 mr-2" />
            Your Privacy Matters
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="prose prose-slate max-w-none pt-6">
            <h2>1. Introduction</h2>
            <p>
              MICA PTO, Co. (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your
              personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
              visit our website.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul>
              <li>Register for an account</li>
              <li>Make a donation</li>
              <li>Sign up for events</li>
              <li>Volunteer for activities</li>
              <li>Subscribe to our newsletter</li>
              <li>Contact us</li>
            </ul>
            <p>
              This information may include:
            </p>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Mailing address</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
              <li>Student/family information (campus, grade level)</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>
              When you visit our website, we may automatically collect certain information about your device, including:
            </p>
            <ul>
              <li>IP address</li>
              <li>Browser type</li>
              <li>Operating system</li>
              <li>Access times</li>
              <li>Pages viewed</li>
              <li>Links clicked</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Process your donations and provide tax receipts</li>
              <li>Manage your account and event registrations</li>
              <li>Send you updates about PTO activities, events, and news</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and enhance security</li>
            </ul>

            <h2>4. Disclosure of Your Information</h2>
            <p>
              We may share your information with:
            </p>
            <ul>
              <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (payment processing, email delivery, website hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>With Your Consent:</strong> We may share your information with your explicit consent</li>
            </ul>
            <p>
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>

            <h2>5. Donation Information</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm mb-2">
                <strong>501(c)(3) Nonprofit Status:</strong>
              </p>
              <p className="text-sm text-green-900 mb-0">
                MICA PTO, Co. is a 501(c)(3) nonprofit organization. All donations are tax-deductible as permitted by law.
                We collect and maintain donation records for tax purposes and to provide you with tax receipts.
                All donations to MICA PTO, Co. are considered charitable contributions and tax-deductible, as no goods
                or services were exchanged for this donation.
              </p>
            </div>

            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information.
              However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot
              guarantee absolute security.
            </p>
            <p>
              Payment information is processed securely through third-party payment processors and is not stored on our servers.
            </p>

            <h2>7. Your Privacy Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access and review your personal information</li>
              <li>Request corrections to your personal information</li>
              <li>Request deletion of your personal information (subject to legal obligations)</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to certain processing of your information</li>
            </ul>
            <p>
              To exercise these rights, please contact us at{' '}
              <a href="mailto:info@centnerpto.org" className="text-primary hover:underline">
                info@centnerpto.org
              </a>
            </p>

            <h2>8. Children&apos;s Privacy</h2>
            <p>
              Our website is not directed to children under the age of 13. We do not knowingly collect personal information
              from children under 13. If you become aware that a child has provided us with personal information, please
              contact us immediately.
            </p>

            <h2>9. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to improve your experience on our website. You can control
              cookies through your browser settings. However, disabling cookies may affect the functionality of our website.
            </p>

            <h2>10. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of
              these external sites. We encourage you to read their privacy policies.
            </p>

            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting
              the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <ul>
              <li>
                Email:{' '}
                <a href="mailto:info@centnerpto.org" className="text-primary hover:underline">
                  info@centnerpto.org
                </a>
              </li>
              <li>Website: <Link href="/" className="text-primary hover:underline">centner-pto.org</Link></li>
            </ul>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-0">
                <strong>About MICA PTO, Co.:</strong> We are a 501(c)(3) nonprofit organization dedicated to supporting the
                Centner Academy community. Your privacy and trust are important to us, and we are committed to protecting
                your personal information.
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
