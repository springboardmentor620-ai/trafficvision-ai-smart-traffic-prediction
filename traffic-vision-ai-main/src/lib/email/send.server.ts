import { sendLovableEmail } from "@lovable.dev/email-js";

/**
 * Sends an HTML email through Lovable's managed email API.
 * Requires the project's sender domain to be configured (Cloud -> Emails).
 */
export async function sendHtmlEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
}): Promise<{ success: boolean; status?: string }> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  const senderDomain = process.env['EMAIL_SENDER_DOMAIN'];
  if (!apiKey || !senderDomain) {
    throw new Error(
      "Email sending is not set up yet. Add the project's sender domain in Cloud → Emails, then try again.",
    );
  }

  const response = await sendLovableEmail(
    {
      to: opts.to,
      from: `TrafficVision AI <alerts@${senderDomain}>`,
      sender_domain: senderDomain,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      ...(opts.idempotencyKey ? { idempotency_key: opts.idempotencyKey } : {}),
    },
    { apiKey, ...(opts.idempotencyKey ? { idempotencyKey: opts.idempotencyKey } : {}) },
  );

  return { success: response.success, ...(response.status ? { status: response.status } : {}) };
}
