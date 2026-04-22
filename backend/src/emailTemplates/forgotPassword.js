export const forgotPasswordTemplate = (name, resetUrl) => ({
  subject: 'Reset your FirmEdge password',
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:28px;font-weight:700;color:#c9a84c;letter-spacing:1px;font-family:Georgia,serif;">FirmEdge</p>
              <p style="margin:6px 0 0;font-size:10px;color:#6b7280;letter-spacing:4px;text-transform:uppercase;font-family:monospace;">Premium CRM for CA Firms</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#16181f;border:1px solid #2a2d38;border-radius:12px;overflow:hidden;">

              <!-- Gold top line -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:2px;background:linear-gradient(to right,transparent,#c9a84c,transparent);"></td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 48px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#f1f5f9;">Password Reset Request</p>
                    <p style="margin:0 0 28px;font-size:11px;color:#6b7280;letter-spacing:3px;text-transform:uppercase;font-family:monospace;">Secure Access Recovery</p>

                    <p style="margin:0 0 16px;font-size:15px;color:#94a3b8;line-height:1.6;">Hi <strong style="color:#e2e8f0;">${name}</strong>,</p>

                    <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">
                      We received a request to reset the password for your FirmEdge account. Click the button below to set a new password. This link is valid for <strong style="color:#e2e8f0;">1 hour</strong>.
                    </p>

                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
                      <tr>
                        <td style="background-color:#c9a84c;border-radius:8px;">
                          <a href="${resetUrl}"
                             style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:600;color:#0f1117;text-decoration:none;letter-spacing:0.5px;">
                            Reset My Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.6;">
                      If the button above doesn&apos;t work, copy and paste this link into your browser:
                    </p>
                    <p style="margin:0 0 28px;font-size:12px;word-break:break-all;">
                      <a href="${resetUrl}" style="color:#c9a84c;text-decoration:none;">${resetUrl}</a>
                    </p>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                      <tr><td style="height:1px;background-color:#2a2d38;"></td></tr>
                    </table>

                    <p style="margin:0;font-size:12px;color:#64748b;line-height:1.7;">
                      If you didn&apos;t request a password reset, you can safely ignore this email — your account remains secure and no changes have been made.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 6px;font-size:12px;color:#4b5563;">
                &copy; ${new Date().getFullYear()} FirmEdge &mdash; Built for CA Professionals
              </p>
              <p style="margin:0;font-size:11px;color:#374151;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
});
