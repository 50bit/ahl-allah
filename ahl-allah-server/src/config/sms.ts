import twilio from 'twilio';

export type MessageMethod = 'sms' | 'whatsapp';

export interface SmsProvider {
  sendSms: (to: string, message: string, method?: MessageMethod) => Promise<boolean>;
  sendWhatsApp: (to: string, message: string) => Promise<boolean>;
  sendMessage: (to: string, message: string, method: MessageMethod) => Promise<boolean>;
}

class ConsoleSmsProvider implements SmsProvider {
  async sendSms(to: string, message: string): Promise<boolean> {
    console.log(`[SMS] to=${to} message=${message}`);
    return true;
  }

  async sendWhatsApp(to: string, message: string): Promise<boolean> {
    console.log(`[WhatsApp] to=${to} message=${message}`);
    return true;
  }

  async sendMessage(to: string, message: string, method: MessageMethod): Promise<boolean> {
    if (method === 'whatsapp') {
      return this.sendWhatsApp(to, message);
    }
    return this.sendSms(to, message);
  }
}

class TwilioSmsProvider implements SmsProvider {
  private client: twilio.Twilio;
  private fromNumber: string;
  private whatsappNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string, whatsappNumber: string) {
    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber; // Regular SMS number
    this.whatsappNumber = whatsappNumber; // WhatsApp number (e.g., 'whatsapp:+14155238886')
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    try {
      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: to, // Format: +1234567890
        body: message
      });
      
      console.log(`SMS sent: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('SMS send error:', error);
      return false;
    }
  }

  async sendWhatsApp(to: string, message: string): Promise<boolean> {
    try {
      const result = await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:${to}`, // Format: whatsapp:+1234567890
        body: message
      });
      
      console.log(`WhatsApp message sent: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return false;
    }
  }

  async sendMessage(to: string, message: string, method: MessageMethod): Promise<boolean> {
    if (method === 'whatsapp') {
      return this.sendWhatsApp(to, message);
    }
    return this.sendSms(to, message);
  }
}

// Initialize with environment variables
const twilioProvider = new TwilioSmsProvider(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
  process.env.TWILIO_PHONE_NUMBER!, // Regular SMS number
  process.env.TWILIO_WHATSAPP_NUMBER! // WhatsApp number
);

let provider: SmsProvider = process.env.NODE_ENV === 'production' 
  ? twilioProvider 
  : new ConsoleSmsProvider();

export const setSmsProvider = (custom: SmsProvider) => {
  provider = custom;
};

export const sendOtpMessage = async (
  to: string, 
  otp: string, 
  method: MessageMethod = 'sms'
): Promise<boolean> => {
  const message = `Your verification code is: ${otp}. This code will expire in 5 minutes.`;
  return provider.sendMessage(to, message, method);
};

export const sendSms = async (to: string, message: string): Promise<boolean> => {
  return provider.sendSms(to, message);
};

export const sendWhatsApp = async (to: string, message: string): Promise<boolean> => {
  return provider.sendWhatsApp(to, message);
};