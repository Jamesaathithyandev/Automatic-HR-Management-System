/**
 * Email notification service via Resend API
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<{ success: boolean; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "RemoteHR <attendance@remotehr.io>";

  if (!apiKey || apiKey.includes("your_api_key")) {
    // Graceful fallback for local development without active credentials
    console.log(`[Resend Email Mock] Sending email to: ${to} | Subject: ${subject}`);
    return { success: true, id: "mock-email-id" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Resend Error]", errorText);
      return { success: false };
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error("[Resend Exception]", error);
    return { success: false };
  }
}

/**
 * HTML Email Template styled with RemoteHR tokens
 */
export function buildAttendanceEmailTemplate(title: string, bodyText: string, ctaLabel?: string, ctaUrl?: string) {
  return `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif, -apple-system; max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; padding: 36px; border: 1px solid #ECEEF6; box-shadow: 0 10px 28px rgba(20, 18, 58, 0.05);">
      <div style="display: flex; align-items: center; margin-bottom: 24px;">
        <div style="background-color: #6C5CE7; width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: #FFFFFF; font-weight: bold; margin-right: 12px; text-align: center; line-height: 36px;">
          HR
        </div>
        <span style="font-size: 18px; font-weight: 800; color: #14123A;">RemoteHR Workplace</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 700; color: #14123A; margin-bottom: 12px;">${title}</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #5E5D78; margin-bottom: 24px;">${bodyText}</p>
      ${
        ctaLabel && ctaUrl
          ? `<a href="${ctaUrl}" style="display: inline-block; background-color: #14123A; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 12px;">${ctaLabel}</a>`
          : ""
      }
      <hr style="border: none; border-top: 1px solid #ECEEF6; margin-top: 32px; margin-bottom: 16px;" />
      <p style="font-size: 11px; color: #7D7C94;">Automated notification from RemoteHR Attendance System. No location or biometric tracking.</p>
    </div>
  `;
}

