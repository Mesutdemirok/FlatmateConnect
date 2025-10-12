import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.EMAIL_FROM || 'info@odanet.com.tr';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5000';

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationLink = `${APP_BASE_URL}/api/auth/verify-email?token=${token}`;
  
  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: 'Odanet – E-posta Doğrulama',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Odanet'e Hoş Geldiniz!</h2>
        <p>Merhaba ${name},</p>
        <p>Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
        <p style="margin: 20px 0;">
          <a href="${verificationLink}" 
             style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            E-postamı Doğrula
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">Bu bağlantı 24 saat geçerlidir.</p>
        <p style="color: #666; font-size: 14px;">Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Odanet - Güvenilir ev arkadaşı bulma platformu</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetLink = `${APP_BASE_URL}/giris?tab=reset&token=${token}`;
  
  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: 'Odanet – Şifre Sıfırlama',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Şifre Sıfırlama Talebi</h2>
        <p>Merhaba ${name},</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <p style="margin: 20px 0;">
          <a href="${resetLink}" 
             style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Şifremi Sıfırla
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">Bu bağlantı 10 dakika geçerlidir.</p>
        <p style="color: #666; font-size: 14px;">Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Odanet - Güvenilir ev arkadaşı bulma platformu</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
