/**
 * Slack Incoming Webhook notification dispatcher
 */

interface SlackMessagePayload {
  title: string;
  message: string;
  color?: string; // hex e.g. #6C5CE7 or #10B981
  fields?: Array<{ title: string; value: string; short?: boolean }>;
}

export async function sendSlackAlert({
  title,
  message,
  color = "#6C5CE7",
  fields = [],
}: SlackMessagePayload): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl.includes("hooks.slack.com/services/xxx")) {
    console.log(`[Slack Webhook Mock] ${title}: ${message}`);
    return true;
  }

  try {
    const payload = {
      attachments: [
        {
          color,
          title,
          text: message,
          fields,
          footer: "RemoteHR Attendance Management",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (error) {
    console.error("[Slack Webhook Exception]", error);
    return false;
  }
}

