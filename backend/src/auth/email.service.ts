import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly fromAddress: string;
  private readonly frontendUrl: string;

  constructor() {
    this.fromAddress = process.env.MAIL_FROM || 'CodeLand <noreply@codeland.com>';
    this.frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5174').replace(/\/+$/, '');

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`Email service configured using SMTP host: ${host}:${port}`);
    } else {
      this.logger.warn(
        'SMTP credentials not fully configured. Email service will run in simulated development mode (links logged safely to console).',
      );
    }
  }

  /**
   * Sends a password reset link to the user.
   */
  async sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<boolean> {
    const subject = 'Reset your CodeLand password';
    const textBody = `We received a request to reset your CodeLand password.

Use the link below to set a new password:
${resetUrl}

This link expires in 15 minutes.

If you did not request this, you can safely ignore this email.
`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070b19; color: #f1f5f9; padding: 40px 20px; border-radius: 12px; max-width: 560px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="color: #60a5fa; font-size: 26px; margin: 0; letter-spacing: -0.5px;">CodeLand</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Your Adventure in Code</p>
        </div>
        <div style="background-color: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 24px; border-radius: 10px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            We received a request to reset your CodeLand account password. Click the button below to choose a new password:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
            ⏱️ <strong>Note:</strong> This link is valid for <strong>15 minutes</strong> and can only be used once.<br>
            If you did not request this password reset, no action is needed and your account remains safe.
          </p>
        </div>
        <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 24px;">
          CodeLand Platform &copy; ${new Date().getFullYear()} &bull; Empowering Young Coders
        </p>
      </div>
    `;

    return this.sendMail(toEmail, subject, textBody, htmlBody, resetUrl);
  }

  /**
   * Sends a confirmation email informing the user that their password was changed.
   */
  async sendPasswordChangedEmail(toEmail: string): Promise<boolean> {
    const subject = 'Your CodeLand password was changed';
    const textBody = `Your CodeLand password was changed successfully.

If this was not you, please contact support or reset your password immediately.
`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070b19; color: #f1f5f9; padding: 40px 20px; border-radius: 12px; max-width: 560px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="color: #60a5fa; font-size: 26px; margin: 0;">CodeLand</h1>
        </div>
        <div style="background-color: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 24px; border-radius: 10px;">
          <h2 style="color: #34d399; font-size: 18px; margin-top: 0;">Password Changed Successfully</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Your CodeLand account password has been updated. You can now use your new password to log in.
          </p>
          <p style="color: #f87171; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
            ⚠️ If you did not make this change, please contact CodeLand support immediately.
          </p>
        </div>
      </div>
    `;

    return this.sendMail(toEmail, subject, textBody, htmlBody);
  }

  /**
   * Sends an informational email for OAuth-only users attempting to reset a local password.
   */
  async sendOAuthLoginReminderEmail(toEmail: string, provider: string): Promise<boolean> {
    const capitalizedProvider = provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
    const subject = `Your CodeLand account uses ${capitalizedProvider} Sign-In`;
    const textBody = `We received a password reset request for your CodeLand account.

Your account is connected via ${capitalizedProvider} Sign-In and does not use a local password.
Please log in using ${capitalizedProvider} on the login page:
${this.frontendUrl}/login
`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070b19; color: #f1f5f9; padding: 40px 20px; border-radius: 12px; max-width: 560px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="color: #60a5fa; font-size: 26px; margin: 0;">CodeLand</h1>
        </div>
        <div style="background-color: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 24px; border-radius: 10px;">
          <h2 style="color: #38bdf8; font-size: 18px; margin-top: 0;">Connected via ${capitalizedProvider}</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            We received a request to reset your password. However, your CodeLand account is registered with <strong>${capitalizedProvider}</strong> and does not use a traditional password.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${this.frontendUrl}/login" style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
              Go to Login with ${capitalizedProvider}
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendMail(toEmail, subject, textBody, htmlBody);
  }

  /**
   * Internal sender helper that supports SMTP or fallback development logger.
   */
  private async sendMail(
    to: string,
    subject: string,
    text: string,
    html: string,
    devLink?: string,
  ): Promise<boolean> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromAddress,
          to,
          subject,
          text,
          html,
        });
        this.logger.log(`Email successfully dispatched to ${to} (Subject: "${subject}")`);
        return true;
      } catch (err: any) {
        this.logger.error(`Failed to send email to ${to}: ${err.message}`);
        return false;
      }
    } else {
      const allowResetLinkLogging =
        process.env.NODE_ENV !== 'production' &&
        process.env.ALLOW_DEV_RESET_LINK_LOGGING === 'true';

      if (allowResetLinkLogging) {
        this.logger.log(
          `[DEV EMAIL SIMULATION]\nTo: ${to}\nSubject: ${subject}\n${
            devLink ? `Reset Link: ${devLink}\n` : ''
          }Content preview: ${text.slice(0, 160)}...`,
        );
      } else {
        this.logger.log(
          `[EMAIL QUEUED] Email notification generated for ${to} (Subject: "${subject}"). Token link logging is disabled for security.`,
        );
      }
      return true;
    }
  }
}
