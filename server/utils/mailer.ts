import nodemailer from 'nodemailer'

interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || '25')
  const secure = process.env.SMTP_SECURE === 'true'
  const from = process.env.SMTP_FROM

  if (!host || !from || !Number.isInteger(port)) {
    throw new Error('SMTP is not configured')
  }

  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD

  return {
    host,
    port,
    secure,
    from,
    ...(user && password ? { auth: { user, pass: password } } : {}),
  }
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  // Explicit local mode: display verification emails without an external SMTP account.
  if (process.env.NODE_ENV === 'development' && process.env.TEAMGRID_LOCAL === '1') {
    console.log(`[Local email] To: ${to}\nSubject: ${subject}\n${text}`)
    return
  }

  const config = getSmtpConfig()

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    ignoreTLS: true,
    ...(config.auth ? { auth: config.auth } : {}),
  })

  return transporter.sendMail({
    from: config.from,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  })
}
