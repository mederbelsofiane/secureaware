import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { prisma } from '@/lib/db';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private config: SmtpConfig | null = null;
  private configLoadedAt: number = 0;
  private readonly CONFIG_TTL = 60000; // 1 minute cache

  /**
   * Load SMTP configuration from Settings table, falling back to env vars
   */
  private async loadConfig(): Promise<SmtpConfig> {
    // Return cached config if still fresh
    if (this.config && Date.now() - this.configLoadedAt < this.CONFIG_TTL) {
      return this.config;
    }

    try {
      const settings = await prisma.setting.findMany({
        where: {
          key: {
            in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from_email', 'smtp_from_name', 'smtp_tls'],
          },
        },
      });

      const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

      this.config = {
        host: settingsMap.get('smtp_host') || process.env.SMTP_HOST || 'mail.secureaware.online',
        port: parseInt(settingsMap.get('smtp_port') || process.env.SMTP_PORT || '587', 10),
        secure: (settingsMap.get('smtp_tls') || 'true') === 'true',
        user: settingsMap.get('smtp_user') || process.env.SMTP_USER || '',
        pass: settingsMap.get('smtp_pass') || process.env.SMTP_PASS || '',
        fromEmail: settingsMap.get('smtp_from_email') || process.env.SMTP_FROM || 'noreply@secureaware.online',
        fromName: settingsMap.get('smtp_from_name') || 'SecureAware Platform',
      };
      this.configLoadedAt = Date.now();
    } catch {
      // Fallback to env vars if DB is unavailable
      this.config = {
        host: process.env.SMTP_HOST || 'mail.secureaware.online',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: true,
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        fromEmail: process.env.SMTP_FROM || 'noreply@secureaware.online',
        fromName: 'SecureAware Platform',
      };
      this.configLoadedAt = Date.now();
    }

    return this.config;
  }

  /**
   * Get or create the nodemailer transporter
   */
  private async getTransporter(): Promise<Transporter> {
    const config = await this.loadConfig();

    // Recreate transporter if config changed
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465, // true for 465, false for other ports
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certs for Mailcow
      },
    });

    return this.transporter;
  }

  /**
   * Invalidate cached config (call after settings update)
   */
  public invalidateConfig(): void {
    this.config = null;
    this.configLoadedAt = 0;
    this.transporter = null;
  }

  /**
   * Send a generic email
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const config = await this.loadConfig();
      const transporter = await this.getTransporter();

      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to,
        subject,
        html,
      });

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  /**
   * Send a welcome email to a new user
   */
  async sendWelcomeEmail(user: { name: string; email: string }): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22d3ee; margin: 0;">🛡️ SecureAware</h1>
          <p style="color: #94a3b8; margin-top: 5px;">Security Awareness Training Platform</p>
        </div>
        <h2 style="color: #f1f5f9;">Welcome, ${user.name}!</h2>
        <p style="color: #cbd5e1; line-height: 1.6;">Your account has been created on the SecureAware platform. You now have access to our comprehensive security awareness training modules.</p>
        <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22d3ee;">
          <p style="margin: 0; color: #e2e8f0;"><strong>What you can do:</strong></p>
          <ul style="color: #94a3b8; padding-left: 20px;">
            <li>Complete training modules</li>
            <li>Take security quizzes</li>
            <li>Practice identifying phishing attempts</li>
            <li>Earn badges and certificates</li>
          </ul>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px; text-align: center;">© SecureAware - DTS Solution</p>
      </div>
    `;
    return this.sendEmail(user.email, 'Welcome to SecureAware Platform', html);
  }

  /**
   * Send a password reset email
   */
  async sendPasswordResetEmail(user: { name: string; email: string }, token: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://secureaware.online'}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22d3ee; margin: 0;">🛡️ SecureAware</h1>
        </div>
        <h2 style="color: #f1f5f9;">Password Reset Request</h2>
        <p style="color: #cbd5e1; line-height: 1.6;">Hello ${user.name}, we received a request to reset your password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #0891b2; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px; text-align: center;">© SecureAware - DTS Solution</p>
      </div>
    `;
    return this.sendEmail(user.email, 'Reset Your SecureAware Password', html);
  }

  /**
   * Send quiz completion notification
   */
  async sendQuizCompletionEmail(
    user: { name: string; email: string },
    quiz: { title: string },
    score: number
  ): Promise<boolean> {
    const passed = score >= 70;
    const statusColor = passed ? '#22c55e' : '#ef4444';
    const statusText = passed ? 'Passed ✅' : 'Needs Improvement ⚠️';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22d3ee; margin: 0;">🛡️ SecureAware</h1>
        </div>
        <h2 style="color: #f1f5f9;">Quiz Results</h2>
        <p style="color: #cbd5e1;">Hello ${user.name}, here are your results for:</p>
        <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #e2e8f0; margin-top: 0;">${quiz.title}</h3>
          <div style="font-size: 48px; font-weight: bold; color: ${statusColor}; margin: 10px 0;">${Math.round(score)}%</div>
          <p style="color: ${statusColor}; font-weight: bold; font-size: 18px; margin: 0;">${statusText}</p>
        </div>
        ${!passed ? '<p style="color: #94a3b8;">We recommend reviewing the training material and trying again.</p>' : '<p style="color: #94a3b8;">Great job! Keep up the good work in staying security-aware.</p>'}
        <p style="color: #64748b; font-size: 12px; margin-top: 30px; text-align: center;">© SecureAware - DTS Solution</p>
      </div>
    `;
    return this.sendEmail(user.email, `Quiz Result: ${quiz.title} - ${Math.round(score)}%`, html);
  }

  /**
   * Send a phishing test/simulation email
   */
  async sendPhishingTestEmail(
    user: { name: string; email: string },
    template: { subject: string; body: string; senderName?: string }
  ): Promise<boolean> {
    return this.sendEmail(user.email, template.subject, template.body);
  }

  /**
   * Send a test email to verify SMTP configuration
   */
  async sendTestEmail(to: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22d3ee; margin: 0;">🛡️ SecureAware</h1>
          <p style="color: #94a3b8; margin-top: 5px;">Email Configuration Test</p>
        </div>
        <div style="background: #1e293b; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
          <h2 style="color: #22c55e; margin-top: 0;">✅ Email Configuration Working!</h2>
          <p style="color: #cbd5e1; line-height: 1.6;">This is a test email from your SecureAware platform. If you received this, your SMTP settings are configured correctly.</p>
          <p style="color: #94a3b8; font-size: 13px; margin-bottom: 0;">Sent at: ${new Date().toISOString()}</p>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px; text-align: center;">© SecureAware - DTS Solution</p>
      </div>
    `;
    return this.sendEmail(to, 'SecureAware - Test Email', html);
  }
}

// Export singleton instance
export const emailService = new EmailService();
