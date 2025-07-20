import nodemailer from 'nodemailer'
import { EmailOptions, EmailService } from '@/interfaces/email.interface'

class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '',
      },
    })
  }

  async sendMail(options: EmailOptions): Promise<boolean> {
    try {
      const { to, subject, text, html } = options

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@example.com',
        to,
        subject,
        text,
        html,
      })

      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }
}

export const emailService = new NodemailerEmailService()
