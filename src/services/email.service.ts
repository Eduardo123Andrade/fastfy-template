import nodemailer from "nodemailer"
import { EmailOptions, EmailService } from "@/interfaces/email.interface"
import { ENVIRONMENT } from "@/config"

class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: ENVIRONMENT.EMAIL_SERVICE,
      host: ENVIRONMENT.EMAIL_HOST,
      port: ENVIRONMENT.EMAIL_PORT,
      secure: ENVIRONMENT.EMAIL_SECURE === "true",
      auth: {
        user: ENVIRONMENT.EMAIL_USER,
        pass: ENVIRONMENT.EMAIL_PASSWORD,
      },
    })
  }

  async sendMail(options: EmailOptions): Promise<boolean> {
    try {
      const { to, subject, text, html } = options

      await this.transporter.sendMail({
        from: ENVIRONMENT.EMAIL_FROM,
        to,
        subject,
        text,
        html,
      })

      return true
    } catch (error) {
      console.error("Error sending email:", error)
      return false
    }
  }
}

export const emailService = new NodemailerEmailService()
