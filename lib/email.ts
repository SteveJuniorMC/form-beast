import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendSubmissionEmailParams {
  to: string;
  formTitle: string;
  respondentName: string;
  respondentEmail: string;
  pdfBuffer: Buffer;
  isCreator: boolean;
  fieldSummary: { label: string; value: string }[];
}

export async function sendSubmissionEmail({
  to,
  formTitle,
  respondentName,
  respondentEmail,
  pdfBuffer,
  isCreator,
  fieldSummary,
}: SendSubmissionEmailParams) {
  const subject = isCreator
    ? `New submission received for "${formTitle}"`
    : `Your submission for "${formTitle}" - copy attached`;

  const summaryText = fieldSummary
    .map((f) => `${f.label}: ${f.value}`)
    .join("\n");

  const bodyText = isCreator
    ? `You received a new submission for "${formTitle}" from ${respondentName} (${respondentEmail}).\n\nSummary:\n${summaryText}\n\nThe completed form PDF is attached.`
    : `Thank you for submitting "${formTitle}".\n\nHere's a summary of your submission:\n${summaryText}\n\nA PDF copy is attached for your records.`;

  await resend.emails.send({
    from: "Form Beast <onboarding@resend.dev>",
    to,
    subject,
    text: bodyText,
    attachments: [
      {
        filename: `${formTitle.replace(/[^a-zA-Z0-9]/g, "_")}_submission.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
