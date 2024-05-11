import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const host: string | undefined = process.env.SMTP_HOST;
const user: string | undefined = process.env.SMTP_USER;
const password: string | undefined = process.env.SMTP_PASSWORD;
const apiUrl: string | undefined = process.env.API_URL;

class MailService {
  transporter;

  constructor() {
    if (!host || !user || !password || !apiUrl) {
      throw new Error('SMTP options is not defined');
    }

    this.transporter = nodemailer.createTransport({
      service: host,
      secure: false,
      auth: {
        user,
        pass: password,
      },
    });
  }

  async sendActivationMail(to: string, link: string) {
    const activationLink = `${apiUrl}/api/auth/activate/${link}`;
    await this.transporter.sendMail({
      from: user,
      to,
      subject: 'Активация аккаунта на ' + process.env.API_URL,
      text: '',
      html: `  
          <div>
            <h1>Для активации перейдите по ссылке</h1>
            <a href="${activationLink}">Активировать аккаунт</a>
          </div>
        `,
    });
  }
}

export default new MailService();
