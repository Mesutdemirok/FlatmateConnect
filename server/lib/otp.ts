import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

let client: ReturnType<typeof twilio> | null = null;

// Initialize Twilio client only if credentials are available
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export async function sendOTP(phone: string): Promise<void> {
  if (!client || !verifyServiceSid) {
    throw new Error('Twilio OTP servisi yapılandırılmamış. Lütfen sistem yöneticinize başvurun.');
  }

  await client.verify.v2
    .services(verifyServiceSid)
    .verifications.create({
      to: phone,
      channel: 'sms',
      locale: 'tr',
    });
}

export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  if (!client || !verifyServiceSid) {
    throw new Error('Twilio OTP servisi yapılandırılmamış. Lütfen sistem yöneticinize başvurun.');
  }

  const verification = await client.verify.v2
    .services(verifyServiceSid)
    .verificationChecks.create({
      to: phone,
      code,
    });

  return verification.status === 'approved';
}
