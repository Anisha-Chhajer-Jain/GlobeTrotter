/**
 * Dev-mode email stub — no SMTP/email provider is configured in this
 * project, so "sending" an email just logs it to the server console with
 * the actionable link front and center. Swap the body of this function for
 * a real provider (Resend, SendGrid, SES, nodemailer+SMTP, etc.) before
 * relying on password reset actually reaching anyone's inbox.
 */
export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  console.log(
    `\n📧 [dev email stub] would send to ${to}\nSubject: ${subject}\n${body}\n`
  );
}
