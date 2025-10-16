import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, FileText, Heart, Shield } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Tax Information - Centner Academy PTO',
  description: 'Tax-deductible donation information for MICA PTO, Co., a 501(c)(3) nonprofit organization',
}

export default function TaxInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted/30 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[hsl(var(--bright-green))] text-white">
            <Shield className="w-4 h-4 mr-2" />
            501(c)(3) Nonprofit Organization
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Tax Information
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Understanding your tax-deductible contributions to MICA PTO, Co.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* 501(c)(3) Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>501(c)(3) Nonprofit Status</CardTitle>
                  <CardDescription className="mt-2">
                    MICA PTO, Co. is a registered 501(c)(3) nonprofit organization under the Internal Revenue Code
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-2">Official Name:</p>
                  <p className="text-sm text-muted-foreground">MICA PTO, Co.</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  As a 501(c)(3) organization, we are exempt from federal income tax under section 501(c)(3) of the Internal Revenue Code.
                  Contributions to MICA PTO, Co. are tax-deductible to the extent permitted by law.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tax-Deductible Donations Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Tax-Deductible Contributions</CardTitle>
                  <CardDescription className="mt-2">
                    Your donations support our mission and may provide tax benefits
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    Important Tax Information:
                  </p>
                  <p className="text-sm text-green-800">
                    All donations to MICA PTO, Co. are considered charitable contributions and tax-deductible,
                    as no goods or services were exchanged for this donation.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">What This Means:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Your monetary donations are fully tax-deductible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>You will receive a receipt for tax purposes for all donations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Keep all donation receipts for your tax records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Consult with your tax advisor about specific deduction amounts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentation Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Donation Receipts</CardTitle>
                  <CardDescription className="mt-2">
                    How we document your contributions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For every donation you make to MICA PTO, Co., you will receive:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground min-w-[120px]">Email Receipt:</span>
                    <span>Sent immediately after your donation is processed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground min-w-[120px]">Tax Statement:</span>
                    <span>Annual summary of all your donations for tax filing purposes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground min-w-[120px]">Documentation:</span>
                    <span>All receipts include our EIN and 501(c)(3) status confirmation</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-3">Important Notes:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• This information is provided for general guidance only and should not be considered tax advice</li>
                <li>• Tax laws and regulations may vary based on your individual circumstances</li>
                <li>• We recommend consulting with a qualified tax professional for specific tax advice</li>
                <li>• For questions about your donation or receipt, please contact us</li>
              </ul>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mt-12 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">
              Ready to Make a Difference?
            </h3>
            <p className="text-muted-foreground">
              Your tax-deductible donation helps us support our students and community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link href="/donate">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg">
                  <Heart className="w-5 h-5 mr-2" />
                  Make a Donation
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
