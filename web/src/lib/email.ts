import { Resend } from "resend";

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const emailFrom = process.env.EMAIL_FROM || "Reltiva <no-reply@reltiva.com>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Core helper to send an email. If Resend is not configured, it logs the email to the console.
 */
async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.warn("⚠️ Resend is not configured. Logging email to console.");
    console.log("=========================================");
    console.log(`FROM: ${emailFrom}`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log("-----------------------------------------");
    console.log("HTML CONTENT:");
    console.log(html);
    console.log("=========================================");
    return { success: true, id: "mock-email-id-" + Math.random().toString(36).substring(7) };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend email error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id || null };
  } catch (error) {
    console.error("❌ Failed to send email via Resend:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Standard visual email container matching Reltiva styling.
 */
function getEmailLayout(title: string, contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #f3f4f6;
          }
          .header {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            padding: 32px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: 0.05em;
            margin: 0;
          }
          .content {
            padding: 40px 32px;
            color: #374151;
            line-height: 1.6;
          }
          .footer {
            background-color: #f9fafb;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #f3f4f6;
            font-size: 12px;
            color: #9ca3af;
          }
          a {
            color: #10b981;
            text-decoration: none;
            font-weight: 600;
          }
          .button {
            display: inline-block;
            background-color: #059669;
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 24px;
            text-align: center;
            text-decoration: none;
          }
          .info-card {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-item {
            margin: 8px 0;
            font-size: 14px;
          }
          .info-label {
            font-weight: 600;
            color: #4b5563;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            background-color: #fee2e2;
            color: #991b1b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">RELTIVA</h1>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p>Reltiva Property Platform &bull; Accra, Ghana</p>
            <p>&copy; 2026 Reltiva. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * 1. Welcome Email
 */
export async function sendWelcomeEmail(to: string, name: string) {
  const html = getEmailLayout(
    "Welcome to Reltiva!",
    `
      <h2 style="color: #111827; margin-top: 0;">Welcome to Reltiva, ${name}! 🎉</h2>
      <p>We are thrilled to welcome you to Reltiva, Ghana's premium real estate and property platform.</p>
      <p>Whether you're looking to purchase your dream home, rent a luxury apartment, or list properties as an agent, we have all the tools to guide you every step of the way.</p>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #111827;">What's Next?</h3>
        <p style="margin-bottom: 0;">You can now log in to complete your profile settings, configure search alerts, save properties you like, or start posting premium real estate listings.</p>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/auth/login" class="button">Go to Dashboard</a>
      </div>
    `
  );

  return sendEmail({ to, subject: "Welcome to Reltiva!", html });
}

/**
 * 2. Enquiry Email to Agent
 */
export async function sendEnquiryEmail(
  to: string,
  agentName: string,
  buyerName: string,
  buyerEmail: string,
  buyerPhone: string | null,
  propertyTitle: string,
  message: string,
  propertyId: string
) {
  const propertyLink = `${process.env.NEXTAUTH_URL}/properties/${propertyId}`;
  const html = getEmailLayout(
    "New Property Enquiry",
    `
      <h2 style="color: #111827; margin-top: 0;">Hello ${agentName},</h2>
      <p>A buyer has submitted a new inquiry regarding your listing: <strong><a href="${propertyLink}">${propertyTitle}</a></strong>.</p>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #111827;">Buyer Details</h3>
        <div class="info-item"><span class="info-label">Name:</span> ${buyerName}</div>
        <div class="info-item"><span class="info-label">Email:</span> ${buyerEmail}</div>
        <div class="info-item"><span class="info-label">Phone:</span> ${buyerPhone || "Not provided"}</div>
      </div>

      <div class="info-card" style="background-color: #ecfdf5; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0; color: #065f46;">Message</h3>
        <p style="margin-bottom: 0; font-style: italic; color: #047857;">"${message}"</p>
      </div>

      <p>Please log in to your agent inbox to reply to this message directly or view property details.</p>

      <div style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard/agent/enquiries" class="button">Open Inbox</a>
      </div>
    `
  );

  return sendEmail({ to, subject: `New enquiry for "${propertyTitle}"`, html });
}

/**
 * 3. Reports Moderation Alert to System Admin
 */
export async function sendReportEmail(
  to: string,
  adminName: string,
  reporterName: string,
  propertyTitle: string,
  reason: string,
  propertyId: string
) {
  const propertyLink = `${process.env.NEXTAUTH_URL}/properties/${propertyId}`;
  const html = getEmailLayout(
    "Listing Reported",
    `
      <h2 style="color: #111827; margin-top: 0;">Hello ${adminName},</h2>
      <p>A property listing has been flagged by a user for review: <strong><a href="${propertyLink}">${propertyTitle}</a></strong>.</p>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #111827;">Report Details</h3>
        <div class="info-item"><span class="info-label">Listing Title:</span> ${propertyTitle}</div>
        <div class="info-item"><span class="info-label">Reported By:</span> ${reporterName}</div>
        <div class="info-item"><span class="info-label">Reason:</span> <span class="badge">Flagged</span></div>
      </div>

      <div class="info-card" style="background-color: #fffbeb; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #92400e;">Description of Violation</h3>
        <p style="margin-bottom: 0; color: #b45309;">"${reason}"</p>
      </div>

      <p>Please review this listing immediately in the admin reports center to take appropriate moderation actions.</p>

      <div style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard/admin/reports" class="button">Open Reports Inbox</a>
      </div>
    `
  );

  return sendEmail({ to, subject: `⚠️ Flagged Listing Alert: ${propertyTitle}`, html });
}

/**
 * 4. Password Reset Link Email
 */
export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  const html = getEmailLayout(
    "Reset Your Password",
    `
      <h2 style="color: #111827; margin-top: 0;">Hi ${name},</h2>
      <p>We received a request to reset the password associated with your Reltiva account.</p>
      <p>Click the button below to choose a new password. This reset link is valid for <strong>1 hour</strong>.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>

      <p style="font-size: 13px; color: #6b7280;">If the button does not work, copy and paste the link below directly into your web browser:</p>
      <p style="font-size: 13px; word-break: break-all;"><a href="${resetLink}">${resetLink}</a></p>
      
      <div style="border-top: 1px solid #f3f4f6; margin-top: 30px; padding-top: 20px;">
        <p style="font-size: 12px; color: #9ca3af; margin-bottom: 0;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
      </div>
    `
  );

  return sendEmail({ to, subject: "Reset your Reltiva password", html });
}

/**
 * 5. Password Changed Confirmation
 */
export async function sendPasswordChangedEmail(to: string, name: string) {
  const html = getEmailLayout(
    "Password Reset Successful",
    `
      <h2 style="color: #111827; margin-top: 0;">Hello ${name},</h2>
      <p>This is confirmation that the password for your Reltiva account has been successfully changed.</p>
      
      <div class="info-card" style="background-color: #ecfdf5; border-left: 4px solid #10b981;">
        <p style="margin: 0; color: #065f46; font-weight: 600;">Security Notice</p>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #047857;">If you did not perform this action, please contact support immediately to lock your account.</p>
      </div>

      <p>You can now log in using your new credentials.</p>

      <div style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/auth/login" class="button">Log In</a>
      </div>
    `
  );

  return sendEmail({ to, subject: "Security Update: Reltiva Password Changed", html });
}

/**
 * 6. Profile/Credentials Changed Alert
 */
export async function sendProfileUpdatedEmail(to: string, name: string, updatedFields: string[]) {
  const fieldList = updatedFields.map(field => `<li><strong>${field}</strong></li>`).join("");

  const html = getEmailLayout(
    "Profile Updated",
    `
      <h2 style="color: #111827; margin-top: 0;">Hello ${name},</h2>
      <p>Your Reltiva account profile details have been modified. The following attributes were updated:</p>
      
      <ul style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
        ${fieldList}
      </ul>

      <div class="info-card" style="background-color: #f3f4f6; border-left: 4px solid #4b5563;">
        <p style="margin: 0; font-weight: 600;">Did not make this change?</p>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #4b5563;">If these changes were not made by you, please log in and change your password, or contact support.</p>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/auth/login" class="button">Go to Profile</a>
      </div>
    `
  );

  return sendEmail({ to, subject: "Security Update: Reltiva Profile Updated", html });
}

/**
 * 7. Payment Failed Email
 */
export async function sendPaymentFailedEmail(to: string, name: string, planName: string) {
  const html = getEmailLayout(
    "Subscription Payment Failed",
    `
      <h2 style="color: #991b1b; margin-top: 0;">Subscription Payment Failed ⚠️</h2>
      <p>Hello ${name},</p>
      <p>We were unable to process your monthly subscription payment for the <strong>${planName}</strong>.</p>
      
      <div class="info-card" style="background-color: #fee2e2; border-left: 4px solid #ef4444;">
        <p style="margin: 0; color: #991b1b; font-weight: 600;">Action Required</p>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #b91c1c;">Paystack was unable to complete the transaction. To prevent your account features from being downgraded to the Free Plan, please update your billing method as soon as possible.</p>
      </div>

      <p>Log in to your subscription dashboard to manage your payment settings or retry the upgrade.</p>

      <div style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard/agent/subscription" class="button" style="background-color: #ef4444;">Manage Subscription</a>
      </div>
    `
  );

  return sendEmail({ to, subject: `Action Required: Payment Failed for ${planName}`, html });
}

