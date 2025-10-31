import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const emailConfig = {
  from: process.env.EMAIL_FROM || 'a99.bdr@gmail.com',
  smtpServer: process.env.EMAIL_SMTP_SERVER || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  username: process.env.EMAIL_USERNAME || 'a99.bdr@gmail.com',
  password: process.env.EMAIL_PASSWORD || 'acxv mzkd ipin wmyn'
};

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: emailConfig.smtpServer,
    port: emailConfig.port,
    secure: true, // true for 465, false for other ports
    auth: {
      user: emailConfig.username,
      pass: emailConfig.password
    }
  });
};

export interface EmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (message: EmailMessage): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: emailConfig.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
