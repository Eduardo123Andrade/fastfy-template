import { emailService } from './email.service'
import { UserDto } from '@/interfaces'

interface SendActivationEmail {
  userName: string
  userEmail: string
  token: string
}

export const sendActivationEmail = async (data: SendActivationEmail): Promise<boolean> => {
  const subject = 'Ative sua conta'
  const html = `
    <h1>Olá ${data.userName},</h1>
    <p>Obrigado por se cadastrar em nossa plataforma.</p>
    <p>Para ativar sua conta, use o código: <strong>${data.token}</strong></p>
    <p>Este código expira em 24 horas.</p>
  `

  return emailService.sendMail({
    to: data.userEmail,
    subject,
    html,
  })
}
