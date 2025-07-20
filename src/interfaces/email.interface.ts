export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface EmailService {
  sendMail(options: EmailOptions): Promise<boolean>;
}