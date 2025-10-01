export interface SmsProvider {
  sendSms: (to: string, message: string) => Promise<boolean>;
}

class ConsoleSmsProvider implements SmsProvider {
  async sendSms(to: string, message: string): Promise<boolean> {
    console.log(`[SMS] to=${to} message=${message}`);
    return true;
  }
}

let provider: SmsProvider = new ConsoleSmsProvider();

export const setSmsProvider = (custom: SmsProvider) => {
  provider = custom;
};

export const sendSms = async (to: string, message: string): Promise<boolean> => {
  return provider.sendSms(to, message);
};


