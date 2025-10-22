import { Resend } from 'resend'

// Lazy initialize Resend to avoid build-time errors
let resendInstance: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not configured. Email sending is disabled.')
    return null
  }

  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }

  return resendInstance
}

export interface DonationReceiptData {
  donorName: string
  donorEmail: string
  amount: number
  currency: string
  donationType: string
  isRecurring: boolean
  recurringInterval?: string | null
  transactionId: string
  date: string
  studentName?: string | null
  studentGrade?: string | null
  campus?: string | null
  message?: string | null
}

/**
 * Send a donation receipt email
 */
export async function sendDonationReceipt(
  data: DonationReceiptData
): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient()

  if (!resend) {
    return {
      success: false,
      error: 'Email service not configured'
    }
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Centner Academy PTO <donations@centnerpto.org>',
      to: [data.donorEmail],
      subject: `Thank you for your ${data.isRecurring ? 'recurring ' : ''}donation!`,
      html: generateDonationReceiptHTML(data),
    })

    if (error) {
      console.error('Error sending donation receipt:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Donation receipt sent:', emailData?.id)
    return { success: true }
  } catch (error) {
    console.error('Failed to send donation receipt:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Generate HTML for donation receipt email
 */
function generateDonationReceiptHTML(data: DonationReceiptData): string {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: data.currency.toUpperCase(),
  }).format(data.amount / 100)

  const donationTypeLabel = formatDonationType(data.donationType)
  const recurringText = data.isRecurring
    ? `This is a recurring ${data.recurringInterval} donation.`
    : 'This is a one-time donation.'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Generosity!</h1>
  </div>

  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-bottom: 20px;">Dear ${data.donorName},</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for your generous donation to Centner Academy PTO! Your contribution helps us provide
      exceptional experiences and opportunities for all our students.
    </p>

    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <h2 style="color: #667eea; margin-top: 0;">Donation Details</h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${formattedAmount}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Type:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${donationTypeLabel}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Frequency:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.isRecurring ? `Recurring (${data.recurringInterval})` : 'One-time'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Transaction ID:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-family: monospace; font-size: 12px;">${data.transactionId}</td>
        </tr>
        ${data.studentName ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Student:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.studentName}${data.studentGrade ? ` (Grade ${data.studentGrade})` : ''}</td>
        </tr>
        ` : ''}
        ${data.campus ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Campus:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.campus}</td>
        </tr>
        ` : ''}
      </table>

      ${data.message ? `
      <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 6px;">
        <p style="margin: 0; font-style: italic; color: #666;">"${data.message}"</p>
      </div>
      ` : ''}
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      ${recurringText} ${data.isRecurring ? 'You can manage or cancel your recurring donation at any time through your account dashboard.' : ''}
    </p>

    <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0; font-size: 14px; color: #856404;">
        <strong>Tax Deduction Information:</strong> Centner Academy PTO is a 501(c)(3) non-profit organization.
        Your donation may be tax-deductible. Please consult with your tax advisor and keep this receipt for your records.
        EIN: [TO BE ADDED]
      </p>
    </div>

    <p style="font-size: 16px; margin-top: 30px;">
      Your support directly impacts our students' educational experience. Together, we're building a stronger community!
    </p>

    <p style="font-size: 16px; margin-bottom: 10px;">With gratitude,</p>
    <p style="font-size: 16px; margin-top: 0;"><strong>The Centner Academy PTO Team</strong></p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <div style="text-align: center; font-size: 12px; color: #999;">
      <p>Questions? Contact us at <a href="mailto:info@centnerpto.org" style="color: #667eea;">info@centnerpto.org</a></p>
      <p>Centner Academy PTO | Making a Difference, One Student at a Time</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Format donation type for display
 */
function formatDonationType(type: string): string {
  const typeMap: Record<string, string> = {
    general: 'General Fund',
    playground: 'Playground Equipment',
    stem: 'STEM Programs',
    arts: 'Arts & Music',
    field_trips: 'Field Trips',
    teacher_appreciation: 'Teacher Appreciation',
    campus_specific: 'Campus-Specific Project',
  }
  return typeMap[type] || 'General Fund'
}
