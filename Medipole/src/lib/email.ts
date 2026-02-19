import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import sgMail from "@sendgrid/mail";
import { logger } from "./logger";

// Email provider types
export type EmailProvider = "ses" | "sendgrid";

// Email configuration interface
interface EmailConfig {
  provider: EmailProvider;
  from: string;
  fromName: string;
  sandboxMode: boolean;
}

// Email message interface
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// AWS SES Configuration
const sesConfig = {
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
};

// SendGrid Configuration
const sendGridConfig = {
  apiKey: process.env.SENDGRID_API_KEY!,
};

// Email service class
class EmailService {
  private provider: EmailProvider;
  private from: string;
  private fromName: string;
  private sandboxMode: boolean;
  private sesClient: SESClient | null = null;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config: EmailConfig) {
    this.provider = config.provider;
    this.from = config.from;
    this.fromName = config.fromName;
    this.sandboxMode = config.sandboxMode;
    this.maxRetries = parseInt(process.env.EMAIL_MAX_RETRIES || "3");
    this.retryDelay = parseInt(process.env.EMAIL_RETRY_DELAY || "1000");

    // Initialize provider clients
    if (this.provider === "ses") {
      this.sesClient = new SESClient(sesConfig);
    } else if (this.provider === "sendgrid") {
      sgMail.setApiKey(sendGridConfig.apiKey);
    }
  }

  // Send email method with retry logic
  async sendEmail(
    message: EmailMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(
          `Sending email to ${message.to} via ${this.provider} (attempt ${attempt}/${this.maxRetries})`,
          {
            metadata: {
              subject: message.subject,
              sandboxMode: this.sandboxMode,
            },
          }
        );

        if (this.provider === "ses") {
          return await this.sendViaSES(message);
        } else {
          return await this.sendViaSendGrid(message);
        }
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Email sending attempt ${attempt} failed`, {
          metadata: {
            error: lastError.message,
            provider: this.provider,
            to: message.to,
            attempt,
          },
        });

        // Don't retry on validation errors or final attempt
        if (attempt === this.maxRetries || this.isValidationError(lastError)) {
          break;
        }

        // Wait before retry
        await this.delay(this.retryDelay * attempt); // Exponential backoff
      }
    }

    logger.error("Email sending failed after all retries", {
      metadata: {
        error: lastError?.message,
        provider: this.provider,
        to: message.to,
        attempts: this.maxRetries,
      },
    });

    return {
      success: false,
      error: lastError?.message || "Failed to send email after all retries",
    };
  }

  // Helper method to check if error is validation-related
  private isValidationError(error: Error): boolean {
    const validationErrors = [
      "Invalid email address",
      "Email address is not verified",
      "The request signature we calculated does not match",
      "InvalidClientTokenId",
    ];

    return validationErrors.some((msg) => error.message.includes(msg));
  }

  // Helper method for delay
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Send via AWS SES
  private async sendViaSES(
    message: EmailMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.sesClient) {
      throw new Error("SES client not initialized");
    }

    const command = new SendEmailCommand({
      Source: `${this.fromName} <${this.from}>`,
      Destination: {
        ToAddresses: [message.to],
      },
      Message: {
        Subject: {
          Data: message.subject,
        },
        Body: {
          Html: {
            Data: message.html,
          },
          Text: {
            Data: message.text || this.stripHtml(message.html),
          },
        },
      },
    });

    try {
      const response = await this.sesClient.send(command);
      logger.info("Email sent via SES", {
        metadata: { messageId: response.MessageId },
      });
      return { success: true, messageId: response.MessageId };
    } catch (error) {
      throw error;
    }
  }

  // Send via SendGrid
  private async sendViaSendGrid(
    message: EmailMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const msg = {
      to: message.to,
      from: {
        email: this.from,
        name: this.fromName,
      },
      subject: message.subject,
      html: message.html,
      text: message.text || this.stripHtml(message.html),
    };

    try {
      const response = await sgMail.send(msg);
      const messageId =
        (response[0]?.headers?.["x-message-id"] as string) || "unknown";
      logger.info("Email sent via SendGrid", {
        metadata: { messageId },
      });
      return { success: true, messageId };
    } catch (error) {
      throw error;
    }
  }

  // Helper to strip HTML for text version
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "");
  }

  // Get current configuration
  getConfig(): EmailConfig {
    return {
      provider: this.provider,
      from: this.from,
      fromName: this.fromName,
      sandboxMode: this.sandboxMode,
    };
  }
}

// Email template functions
export const emailTemplates = {
  // Welcome email template
  welcome: (userName: string, verificationLink?: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Medipole</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 30px 40px; text-align: center; border-bottom: 1px solid #eee;">
                  <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Welcome to Medipole!</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px;">
                  <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${userName}! 👋</h2>
                  <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                    We're excited to have you join our healthcare platform. Medipole connects donors, hospitals, and patients to make blood donation more efficient and accessible.
                  </p>
                  ${
                    verificationLink
                      ? `
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      Verify Your Email
                    </a>
                  </div>
                  <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
                    Click the button above to verify your email address and get started.
                  </p>
                  `
                      : ""
                  }
                  <p style="color: #666; line-height: 1.6; margin: 30px 0 0 0;">
                    If you have any questions, feel free to reach out to our support team.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: #f8f9fa; border-top: 1px solid #eee; text-align: center;">
                  <p style="color: #888; font-size: 12px; margin: 0;">
                    This is an automated email from Medipole. Please do not reply to this message.
                  </p>
                  <p style="color: #888; font-size: 12px; margin: 5px 0 0 0;">
                    © 2026 Medipole. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,

  // Password reset template
  passwordReset: (
    userName: string,
    resetLink: string,
    expiryHours: number = 24
  ) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Medipole</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 30px 40px; text-align: center; border-bottom: 1px solid #eee;">
                  <h1 style="color: #dc2626; margin: 0; font-size: 28px;">Password Reset</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px;">
                  <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${userName},</h2>
                  <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                    We received a request to reset your password for your Medipole account.
                  </p>
                  <div style="background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 6px; padding: 20px; margin: 20px 0;">
                    <p style="color: #92400e; margin: 0 0 10px 0; font-weight: bold;">
                      ⚠️ Important Security Notice
                    </p>
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                      This link will expire in ${expiryHours} hours. If you didn't request this reset, please ignore this email.
                    </p>
                  </div>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                       style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      Reset Password
                    </a>
                  </div>
                  <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
                    Click the button above to reset your password securely.
                  </p>
                  <p style="color: #666; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px;">
                    For security reasons, this link can only be used once and will expire after ${expiryHours} hours.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: #f8f9fa; border-top: 1px solid #eee; text-align: center;">
                  <p style="color: #888; font-size: 12px; margin: 0;">
                    This is an automated email from Medipole. Please do not reply to this message.
                  </p>
                  <p style="color: #888; font-size: 12px; margin: 5px 0 0 0;">
                    © 2026 Medipole. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,

  // Notification template
  notification: (
    userName: string,
    title: string,
    message: string,
    actionLink?: string,
    actionText?: string
  ) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Medipole</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 30px 40px; text-align: center; border-bottom: 1px solid #eee;">
                  <h1 style="color: #059669; margin: 0; font-size: 28px;">${title}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px;">
                  <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${userName},</h2>
                  <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                    ${message}
                  </p>
                  ${
                    actionLink && actionText
                      ? `
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${actionLink}" 
                       style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      ${actionText}
                    </a>
                  </div>
                  `
                      : ""
                  }
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: #f8f9fa; border-top: 1px solid #eee; text-align: center;">
                  <p style="color: #888; font-size: 12px; margin: 0;">
                    This is an automated email from Medipole. Please do not reply to this message.
                  </p>
                  <p style="color: #888; font-size: 12px; margin: 5px 0 0 0;">
                    © 2026 Medipole. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
};

// Validate email configuration
export function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const provider = (process.env.EMAIL_PROVIDER as EmailProvider) || "ses";

  // Check required environment variables
  if (!process.env.EMAIL_PROVIDER) {
    errors.push("EMAIL_PROVIDER is required (ses or sendgrid)");
  }

  if (provider === "ses") {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      errors.push("AWS_ACCESS_KEY_ID is required for SES");
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY) {
      errors.push("AWS_SECRET_ACCESS_KEY is required for SES");
    }
    if (!process.env.SES_EMAIL_SENDER) {
      errors.push("SES_EMAIL_SENDER is required for SES");
    }
  } else if (provider === "sendgrid") {
    if (!process.env.SENDGRID_API_KEY) {
      errors.push("SENDGRID_API_KEY is required for SendGrid");
    }
    if (!process.env.SENDGRID_SENDER) {
      errors.push("SENDGRID_SENDER is required for SendGrid");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Initialize email service
export function createEmailService(): EmailService | null {
  const configResult = validateEmailConfig();

  if (!configResult.valid) {
    logger.error("Email configuration invalid", {
      metadata: {
        errors: configResult.errors,
      },
    });
    return null;
  }

  const provider = (process.env.EMAIL_PROVIDER as EmailProvider) || "ses";

  const config: EmailConfig = {
    provider,
    from:
      provider === "ses"
        ? process.env.SES_EMAIL_SENDER!
        : process.env.SENDGRID_SENDER!,
    fromName: process.env.EMAIL_FROM_NAME || "Medipole",
    sandboxMode:
      provider === "ses"
        ? process.env.SES_SANDBOX_MODE === "true"
        : process.env.SENDGRID_SANDBOX_MODE === "true",
  };

  return new EmailService(config);
}
