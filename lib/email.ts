import sgMail from '@sendgrid/mail'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
  from?: string
}

/**
 * Send email via SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { noreplyEmail } = await import('@/lib/brand')
    const msg = {
      to: options.to,
      from: options.from || process.env.SENDGRID_FROM_EMAIL || noreplyEmail,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    }

    await sgMail.send(msg)
    return true
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}


