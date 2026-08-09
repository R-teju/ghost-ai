import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface InvitationEmailParams {
  to: string
  projectName: string
  inviterName: string
  viewUrl: string
}

/**
 * Sends a styled invitation email to a collaborator with a link to the
 * read-only viewer page. The collaborator will also need the room password
 * (shared separately by the owner) to access the live canvas.
 */
export async function sendInvitationEmail({
  to,
  projectName,
  inviterName,
  viewUrl,
}: InvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Ghost AI <onboarding@resend.dev>",
      to: [to],
      subject: `You've been invited to view "${projectName}" on Ghost AI`,
      html: buildInvitationHtml({ projectName, inviterName, viewUrl }),
    })

    if (error) {
      console.error("Resend email error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown email error"
    console.error("Failed to send invitation email:", message)
    return { success: false, error: message }
  }
}

function buildInvitationHtml({
  projectName,
  inviterName,
  viewUrl,
}: {
  projectName: string
  inviterName: string
  viewUrl: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #27272a;">
              <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);width:48px;height:48px;border-radius:12px;line-height:48px;text-align:center;font-size:20px;color:#fff;font-weight:bold;">G</div>
              <h1 style="margin:16px 0 0;font-size:20px;font-weight:700;color:#fafafa;letter-spacing:-0.02em;">Ghost AI</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#fafafa;">You're invited to view a project</h2>
              <p style="margin:0 0 24px;font-size:14px;color:#a1a1aa;line-height:1.6;">
                <strong style="color:#e4e4e7;">${inviterName}</strong> has invited you to view
                <strong style="color:#e4e4e7;">"${projectName}"</strong> on Ghost AI.
              </p>

              <p style="margin:0 0 24px;font-size:13px;color:#71717a;line-height:1.6;">
                You'll be able to watch the live canvas in real-time as the owner makes changes. You'll need the <strong style="color:#a1a1aa;">room password</strong> that was shared with you to access the project.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${viewUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;letter-spacing:-0.01em;">
                      View Project →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:11px;color:#52525b;line-height:1.5;">
                If you can't click the button, copy and paste this link into your browser:<br/>
                <a href="${viewUrl}" style="color:#818cf8;text-decoration:underline;word-break:break-all;">${viewUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #27272a;text-align:center;">
              <p style="margin:0;font-size:11px;color:#52525b;">
                This invitation was sent from Ghost AI. If you didn't expect this, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
