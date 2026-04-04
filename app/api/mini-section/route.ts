import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Mcq = {
  unit: string;
  prompt: string;
  choices: { A: string; B: string; C: string; D: string };
  answer: "A" | "B" | "C" | "D";
  explanation: string;
};

type Frq = {
  unit: string;
  type: string;
  prompt: string;
};

type MiniSection = {
  scope: string;
  mcqs: Mcq[];
  frqs: Frq[];
};

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

function isValidMcq(q: any) {
  return (
    q &&
    typeof q.unit === "string" &&
    typeof q.prompt === "string" &&
    q.choices &&
    typeof q.choices.A === "string" &&
    typeof q.choices.B === "string" &&
    typeof q.choices.C === "string" &&
    typeof q.choices.D === "string" &&
    ["A", "B", "C", "D"].includes(q.answer) &&
    typeof q.explanation === "string"
  );
}

function isValidFrq(f: any) {
  return (
    f &&
    typeof f.unit === "string" &&
    typeof f.type === "string" &&
    typeof f.prompt === "string"
  );
}

export async function POST(req: Request) {
  try {
    const { scope } = (await req.json()) as { scope?: string };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const scopeText =
      scope === "all"
        ? "All of AP U.S. Government and Politics"
        : `Unit ${scope} of AP U.S. Government and Politics`;

    const system = `
You are an AP U.S. Government & Politics exam writer.

Generate a timed sprint mini section for ${scopeText}.

You MUST return ONLY a valid JSON object with this EXACT structure:
{
  "scope": "string",
  "mcqs": [
    {
      "unit": "string",
      "prompt": "string",
      "choices": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "answer": "A|B|C|D",
      "explanation": "string"
    }
  ],
  "frqs": [
    {
      "unit": "string",
      "type": "string",
      "prompt": "string"
    }
  ]
}

Rules:
- Return EXACTLY 13 mcqs
- Return EXACTLY 2 frqs
- MCQs should feel AP-style and application-based
- Use scenarios, institutions, constitutional ideas, civil liberties, elections, parties, courts, etc.
- MCQ distractors must be plausible
- MCQ explanations should be 2-4 sentences
- FRQs should be realistic AP-style prompts
- FRQ types can include argument essay, concept application, SCOTUS comparison, quantitative analysis
- No markdown
- No extra text
- JSON ONLY
`.trim();

    const user = `Create one 15-question sprint mini section for ${scopeText}: 13 MCQs and 2 FRQs.`;

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
        max_output_tokens: 6000,
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

    const parsed = safeParseJsonObject(outputText) as MiniSection | null;

    if (!parsed) {
      return NextResponse.json(
        { error: "Could not parse JSON", outputText },
        { status: 500 }
      );
    }

    if (
      !parsed.scope ||
      !Array.isArray(parsed.mcqs) ||
      !Array.isArray(parsed.frqs) ||
      parsed.mcqs.length !== 13 ||
      parsed.frqs.length !== 2 ||
      !parsed.mcqs.every(isValidMcq) ||
      !parsed.frqs.every(isValidFrq)
    ) {
      return NextResponse.json(
        { error: "Invalid mini section format returned", parsed },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}