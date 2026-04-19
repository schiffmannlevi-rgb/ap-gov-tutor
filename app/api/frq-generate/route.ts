import { NextResponse } from "next/server";

export const runtime = "nodejs";

function extractAnyTextFromResponses(data: any): string {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const out = data?.output;
  if (Array.isArray(out)) {
    const chunks: string[] = [];

    for (const msg of out) {
      const content = msg?.content;

      if (Array.isArray(content)) {
        for (const item of content) {
          if (typeof item?.text === "string" && item.text.trim()) {
            chunks.push(item.text);
          }
          if (typeof item?.value === "string" && item.value.trim()) {
            chunks.push(item.value);
          }
          if (typeof item?.content === "string" && item.content.trim()) {
            chunks.push(item.content);
          }
        }
      }

      if (typeof msg?.text === "string" && msg.text.trim()) {
        chunks.push(msg.text);
      }
      if (typeof msg?.content === "string" && msg.content.trim()) {
        chunks.push(msg.content);
      }
    }

    if (chunks.length) return chunks.join("\n").trim();
  }

  return "";
}

function stripCodeFences(s: string) {
  return s.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
}

function safeParseJsonObject(text: string): any | null {
  const t = stripCodeFences(text);

  try {
    return JSON.parse(t);
  } catch {}

  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    try {
      return JSON.parse(t.slice(first, last + 1));
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

Generate EXACTLY ONE realistic AP Microeconomics FRQ prompt.

Requirements:
- Make it sound like a real AP Micro FRQ
- Use applied economics, not just definitions
- Good topics include supply and demand, market structure, costs, elasticity, externalities, or government intervention
- Prompt should be clear and answerable in a student practice setting

Return ONLY valid JSON in this exact format:
{
  "prompt": "string"
}
`
        : `
You are an AP U.S. Government and Politics FRQ writer.

Generate EXACTLY ONE realistic AP Gov FRQ prompt.

Requirements:
- Make it sound like a real AP Gov FRQ
- Use topics like institutions, federalism, civil liberties, political participation, courts, or constitutional reasoning
- Prompt should be clear and answerable in a student practice setting

Return ONLY valid JSON in this exact format:
{
  "prompt": "string"
}
`;

    const user =
      subject === "micro"
        ? "Generate one AP Microeconomics FRQ prompt."
        : "Generate one AP U.S. Government and Politics FRQ prompt.";

    const r = await fetch("https://api.openai.com/v1/responses", {
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
          effort: "low",
        },
        max_output_tokens: 1200,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      return NextResponse.json(
        { error: "OpenAI request failed", details: data },
        { status: 500 }
      );
    }

    const outputText = extractAnyTextFromResponses(data);

    if (!outputText) {
      return NextResponse.json(
        { error: "No output text returned", raw: data },
        { status: 500 }
      );
    }

    const parsed = safeParseJsonObject(outputText);

    if (!parsed || typeof parsed.prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid FRQ format returned", parsed, outputText },
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
