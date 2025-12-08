/**
 * Email Service
 *
 * This module handles sending emails to customers.
 * You can integrate with services like:
 * - SendGrid (https://sendgrid.com/)
 * - Mailgun (https://www.mailgun.com/)
 * - AWS SES (https://aws.amazon.com/ses/)
 * - Postmark (https://postmarkapp.com/)
 *
 * For now, this is a template. Replace with your email service of choice.
 */

export interface FeedbackEmailData {
  customerEmail: string;
  dogName: string;
  feedbackUrl: string;
  products: Array<{
    id: string;
    title: string;
    imageUrl?: string;
  }>;
}

/**
 * Send a feedback questionnaire email to the customer
 */
export async function sendFeedbackEmail(
  data: FeedbackEmailData
): Promise<boolean> {
  const { customerEmail, dogName, feedbackUrl, products } = data;

  // TODO: Replace this with your actual email service integration
  // Example using fetch to call an email API:

  /*
  // Example: SendGrid
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: customerEmail }],
        subject: `How did ${dogName} like their box?`,
      }],
      from: { email: process.env.EMAIL_FROM || 'subscriptions@yourdomain.com' },
      content: [{
        type: 'text/html',
        value: buildFeedbackEmailHtml(dogName, feedbackUrl, products),
      }],
    }),
  });

  return response.ok;
  */

  // For development: Log the email instead of sending
  console.log("📧 Feedback Email (Development Mode):");
  console.log("To:", customerEmail);
  console.log("Subject:", `How did ${dogName} like their box?`);
  console.log("Feedback URL:", feedbackUrl);
  console.log("Products:", products.map((p) => p.title).join(", "));
  console.log("\nHTML Preview:");
  console.log(buildFeedbackEmailHtml(dogName, feedbackUrl, products));

  return true;
}

/**
 * Build the HTML content for the feedback email
 */
function buildFeedbackEmailHtml(
  dogName: string,
  feedbackUrl: string,
  products: Array<{
    id: string;
    title: string;
    imageUrl?: string;
  }>
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How did ${dogName} like their box?</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
    <h1 style="color: #ff9800; margin-top: 0;">🐕 How did ${dogName} like their box?</h1>

    <p>Hi there!</p>

    <p>We hope ${dogName} is enjoying their latest toy subscription box! We'd love to hear your feedback so we can make the next box even better.</p>

    <h2 style="color: #ff9800; font-size: 18px;">Products in this box:</h2>

    <div style="margin: 20px 0;">
      ${products
        .map(
          (product) => `
        <div style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${
            product.imageUrl
              ? `<img src="${product.imageUrl}" alt="${product.title}" style="max-width: 100%; height: auto; border-radius: 5px; margin-bottom: 10px;" />`
              : ""
          }
          <h3 style="margin: 10px 0; font-size: 16px;">${product.title}</h3>
        </div>
      `
        )
        .join("")}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${feedbackUrl}"
         style="display: inline-block; background-color: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Share Your Feedback
      </a>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Your feedback helps us select the perfect toys for ${dogName}'s next box. It only takes 2 minutes!
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 12px; color: #999; text-align: center;">
      Thank you for being a valued subscriber! 🐾<br>
      If you have any questions, please don't hesitate to reach out.
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send a welcome email when a new subscription is created
 */
export async function sendWelcomeEmail(
  customerEmail: string,
  dogName: string
): Promise<boolean> {
  // For development: Log the email instead of sending
  console.log("📧 Welcome Email (Development Mode):");
  console.log("To:", customerEmail);
  console.log("Subject:", `Welcome to the pack, ${dogName}! 🐕`);

  // TODO: Implement actual email sending here

  return true;
}
