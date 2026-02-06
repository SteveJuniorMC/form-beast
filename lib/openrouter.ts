export async function parseFormWithAI(fileUrl: string, mimeType: string) {
  const systemPrompt = `You are a form analysis AI. You analyze images and PDFs of forms and extract their structure.`;

  const userPrompt = `Analyze this form image/document and extract all fillable fields.
Return a JSON object with:
{
  "title": "Form title",
  "description": "Brief description of the form's purpose",
  "fields": [
    {
      "label": "Field label as shown on form",
      "type": "text|textarea|number|date|email|phone|checkbox|select|signature",
      "required": true/false,
      "placeholder": "Example value or hint",
      "options": ["only for select/checkbox types"]
    }
  ]
}
Rules:
- Identify signature lines/boxes as type "signature"
- Use appropriate field types (date for dates, email for emails, etc.)
- Mark fields that appear mandatory as required
- Preserve the order fields appear on the form
- Include all fields, even if partially visible
- Return ONLY valid JSON, no markdown or extra text`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: fileUrl },
            },
            { type: "text", text: userPrompt },
          ],
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in AI response");
  }

  return JSON.parse(content);
}
