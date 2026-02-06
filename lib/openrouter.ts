export async function parseFormWithAI(fileUrl: string, mimeType: string) {
  const systemPrompt = `You are a form analysis AI. You analyze images of forms and extract their structure. Always respond with valid JSON only.`;

  const userPrompt = `Analyze this form image and extract all fillable fields.
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

  // Fetch the file and convert to base64 data URL
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to fetch file: ${fileResponse.status}`);
  }
  const fileBuffer = await fileResponse.arrayBuffer();
  const base64 = Buffer.from(fileBuffer).toString("base64");

  // For PDFs, use image/png mime type as most vision models expect images
  const imageMime = mimeType === "application/pdf" ? "application/pdf" : mimeType;
  const dataUrl = `data:${imageMime};base64,${base64}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
            { type: "text", text: userPrompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0]) {
    throw new Error(`Unexpected AI response: ${JSON.stringify(data).substring(0, 500)}`);
  }

  const content = data.choices[0].message?.content;

  if (!content) {
    throw new Error("No content in AI response");
  }

  // Try to extract JSON from the response (model may wrap it in markdown)
  let jsonStr = content.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${content.substring(0, 300)}`);
  }
}
