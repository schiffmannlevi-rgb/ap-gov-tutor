import { NextResponse } from "next/server";

export const runtime = "nodejs";

function extractOutputText(data: any): string {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (Array.isArray(data?.output)) {
    const parts: string[] = [];

    for (const item of data.output) {
      if (Array.isArray(item?.content)) {
        for (const c of item.content) {
          if (typeof c?.text === "string" && c.text.trim()) {
            parts.push(c.text.trim());
          }
          if (typeof c?.value === "string" && c.value.trim()) {
            parts.push(c.value.trim());
          }
        }
      }

      if (typeof item?.text === "string" && item.text.trim()) {
        parts.push(item.text.trim());
      }
    }

    if (parts.length) return parts.join("\n").trim();
  }

  return "";
}

function parseJsonSafely(text: string) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    try {
      return JSON.parse(cleaned.slice(first, last + 1));
    } catch {}
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { subject?: string };
    const subject = body.subject ?? "gov";

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment" },
        { status: 500 }
      );
    }

    const system =
      subject === "micro"
        ? `
You are an AP Microeconomics FRQ writer.

Generate exactly ONE realistic AP Microeconomics FRQ prompt.

Requirements:
- Make it sound like a real AP Micro FRQ
- Use applied economics, not just a definition
- Keep it clear and answerable by a student
- Focus on topics like supply and demand, elasticity, costs, market structure, or government intervention

Return ONLY valid JSON:
{
  "prompt": "string"
}
`.trim()
        : `
You are an AP U.S. Government and Politics FRQ writer.

Generate exactly ONE realistic AP Gov FRQ prompt.

Requirements:
- Make it sound like a real AP Gov FRQ
- Keep it clear and answerable by a student
- Use topics like institutions, federalism, civil liberties, participation, or constitutional reasoning

Return ONLY valid JSON:
{
  "prompt": "string"
}
`.trim();

    const user =
      subject === "micro"
        ? "Generate one AP Microeconomics FRQ prompt."
        : "Generate one AP U.S. Government and Politics FRQ prompt.";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5",
        input: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        text: {
          format: { type: "json_object" },
        },
        reasoning: {
          effort: "minimal",
        },
        max_output_tokens: 600,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "OpenAI request failed", details: data },
        { status: 500 }
      );
    }

    const outputText = extractOutputText(data);

    if (!outputText) {
      return NextResponse.json(
        { error: "No output text returned", raw: data },
        { status: 500 }
      );
    }

    const parsed = parseJsonSafely(outputText);

    if (!parsed || typeof parsed.prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid FRQ format returned", outputText, raw: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompt: parsed.prompt });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}