import { NextResponse } from "next/server";
import { z } from "zod";
import { createEmailService, emailTemplates, EmailMessage } from "@/lib/email";
import { logger } from "@/lib/logger";
import { handleError } from "@/lib/errorHandler";

// Request validation schema
const emailSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject too long"),
  template: z.enum(["welcome", "passwordReset", "notification"]).optional(),
  templateData: z
    .object({
      userName: z.string().optional(),
      verificationLink: z.string().url().optional(),
      resetLink: z.string().url().optional(),
      expiryHours: z.number().optional(),
      title: z.string().optional(),
      message: z.string().optional(),
      actionLink: z.string().url().optional(),
      actionText: z.string().optional(),
    })
    .optional(),
  html: z.string().optional(),
  text: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = emailSchema.parse(body);

    // Initialize email service
    const emailService = createEmailService();

    if (!emailService) {
      logger.error("Email service initialization failed");
      return NextResponse.json(
        {
          success: false,
          error: "Email service not configured properly",
        },
        { status: 500 }
      );
    }

    // Generate HTML content based on template or provided HTML
    let htmlContent = validatedData.html || "";

    if (validatedData.template && validatedData.templateData) {
      switch (validatedData.template) {
        case "welcome":
          htmlContent = emailTemplates.welcome(
            validatedData.templateData.userName || "User",
            validatedData.templateData.verificationLink
          );
          break;
        case "passwordReset":
          if (!validatedData.templateData.resetLink) {
            return NextResponse.json(
              {
                success: false,
                error: "resetLink is required for password reset template",
              },
              { status: 400 }
            );
          }
          htmlContent = emailTemplates.passwordReset(
            validatedData.templateData.userName || "User",
            validatedData.templateData.resetLink,
            validatedData.templateData.expiryHours
          );
          break;
        case "notification":
          if (
            !validatedData.templateData.title ||
            !validatedData.templateData.message
          ) {
            return NextResponse.json(
              {
                success: false,
                error:
                  "title and message are required for notification template",
              },
              { status: 400 }
            );
          }
          htmlContent = emailTemplates.notification(
            validatedData.templateData.userName || "User",
            validatedData.templateData.title,
            validatedData.templateData.message,
            validatedData.templateData.actionLink,
            validatedData.templateData.actionText
          );
          break;
      }
    }

    if (!htmlContent) {
      return NextResponse.json(
        {
          success: false,
          error:
            "HTML content is required - provide either html or template with templateData",
        },
        { status: 400 }
      );
    }

    // Prepare email message
    const emailMessage: EmailMessage = {
      to: validatedData.to,
      subject: validatedData.subject,
      html: htmlContent,
      text: validatedData.text,
    };

    // Send email
    const result = await emailService.sendEmail(emailMessage);

    if (result.success) {
      logger.info("Email sent successfully", {
        to: validatedData.to,
        subject: validatedData.subject,
        messageId: result.messageId,
        provider: emailService.getConfig().provider,
      });

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        provider: emailService.getConfig().provider,
        sandboxMode: emailService.getConfig().sandboxMode,
      });
    } else {
      logger.error("Email sending failed", {
        to: validatedData.to,
        subject: validatedData.subject,
        error: result.error,
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send email",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error("Email request validation failed", { issues: error.issues });
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return handleError(error, { endpoint: "/api/email", method: "POST" });
  }
}

// Health check endpoint
export async function GET() {
  try {
    const emailService = createEmailService();

    if (!emailService) {
      return NextResponse.json(
        {
          success: false,
          error: "Email service not configured",
          config: {
            provider: process.env.EMAIL_PROVIDER || "not set",
            from:
              process.env.EMAIL_PROVIDER === "ses"
                ? process.env.SES_EMAIL_SENDER
                : process.env.SENDGRID_SENDER,
          },
        },
        { status: 500 }
      );
    }

    const config = emailService.getConfig();

    return NextResponse.json({
      success: true,
      message: "Email service is configured and ready",
      config: {
        provider: config.provider,
        from: config.from,
        fromName: config.fromName,
        sandboxMode: config.sandboxMode,
      },
    });
  } catch (error) {
    return handleError(error, { endpoint: "/api/email", method: "GET" });
  }
}
