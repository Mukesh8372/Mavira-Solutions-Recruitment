import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outbound email via SMTP (nodemailer).
 *
 * Configure in .env:
 *   SMTP_HOST     e.g. smtp.zoho.in / smtp.office365.com / smtpout.secureserver.net
 *   SMTP_PORT     587 (STARTTLS, default) or 465 (SSL)
 *   SMTP_USER     the mailbox that sends, e.g. mukesh@mavirasolutions.com
 *   SMTP_PASS     its password (or app password)
 *   MAIL_NOTIFY_TO  where notifications land (defaults to SMTP_USER)
 *
 * When SMTP is not configured, sends are skipped with a console note —
 * forms keep working and submissions are still saved to the database.
 */

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

export const notifyTo = process.env.MAIL_NOTIFY_TO ?? user ?? "mukesh@mavirasolutions.com";

const configured = Boolean(host && user && pass);

let transporter: Transporter | null = null;
function getTransporter(): Transporter | null {
  if (!configured) return null;
  transporter ??= nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type NotificationMail = {
  subject: string;
  /** label/value rows rendered into the email body */
  rows: [label: string, value: string][];
  /** set so "Reply" in the mailbox goes straight to the person who submitted the form */
  replyTo?: string;
};

/**
 * Send an internal notification email. Never throws — a mail failure must not
 * break the form submission it accompanies (the data is already in the DB).
 */
export async function sendNotification({ subject, rows, replyTo }: NotificationMail): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[mail] SMTP not configured — skipped notification: ${subject}`);
    return;
  }

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `
    <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:6px 16px 6px 0;color:#6b7280;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0;color:#111827">${escapeHtml(value).replace(/\n/g, "<br/>")}</td></tr>`
        )
        .join("")}
    </table>`;

  try {
    await transport.sendMail({
      from: { name: "Mavira Solutions Website", address: user! },
      to: notifyTo,
      subject,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
  } catch (error) {
    console.error(`[mail] Failed to send "${subject}":`, error);
  }
}
