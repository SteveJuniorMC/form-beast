import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateSubmissionPDF } from "@/lib/pdf";
import { sendSubmissionEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();

  const body = await request.json();
  const { formId, respondentName, respondentEmail, values } = body;

  if (!formId || !respondentName || !respondentEmail || !values) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Fetch form and fields
    const { data: form } = await supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .single();

    if (!form || form.status !== "published") {
      return NextResponse.json({ error: "Form not found or not published" }, { status: 404 });
    }

    const { data: fields } = await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", formId)
      .order("sort_order");

    if (!fields) {
      return NextResponse.json({ error: "Form fields not found" }, { status: 404 });
    }

    // Create submission record
    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .insert({
        form_id: formId,
        respondent_email: respondentEmail,
        respondent_name: respondentName,
      })
      .select()
      .single();

    if (subError || !submission) {
      console.error("Submission creation error:", subError);
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
    }

    // Insert submission values
    const valueRecords = fields.map((field) => ({
      submission_id: submission.id,
      field_id: field.id,
      value: values[field.id] || null,
    }));

    await supabase.from("submission_values").insert(valueRecords);

    // Build field data for PDF
    const pdfFields = fields.map((field) => ({
      label: field.label,
      value: values[field.id] || "",
      type: field.type,
    }));

    const submittedAt = new Date().toISOString();

    // Generate PDF
    const pdfBuffer = await generateSubmissionPDF({
      title: form.title,
      description: form.description || undefined,
      respondentName,
      respondentEmail,
      fields: pdfFields,
      submittedAt,
    });

    // Upload PDF to Supabase Storage
    const pdfFileName = `${submission.id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(pdfFileName, pdfBuffer, {
        contentType: "application/pdf",
      });

    if (uploadError) {
      console.error("PDF upload error:", uploadError);
    }

    const { data: { publicUrl: pdfUrl } } = supabase.storage
      .from("submissions")
      .getPublicUrl(pdfFileName);

    // Update submission with PDF URL
    await supabase
      .from("submissions")
      .update({ pdf_url: pdfUrl })
      .eq("id", submission.id);

    // Build field summary for emails
    const fieldSummary = fields
      .filter((f) => f.type !== "signature")
      .map((field) => ({
        label: field.label,
        value: values[field.id] || "—",
      }));

    // Get creator's email
    const { data: creator } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", form.creator_id)
      .single();

    // Send emails (non-blocking — don't fail the submission if email fails)
    try {
      if (creator?.email) {
        await sendSubmissionEmail({
          to: creator.email,
          formTitle: form.title,
          respondentName,
          respondentEmail,
          pdfBuffer,
          isCreator: true,
          fieldSummary,
        });
      }

      await sendSubmissionEmail({
        to: respondentEmail,
        formTitle: form.title,
        respondentName,
        respondentEmail,
        pdfBuffer,
        isCreator: false,
        fieldSummary,
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Don't fail the submission just because email failed
    }

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 });
  }
}
