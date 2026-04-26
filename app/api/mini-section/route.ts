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
  subject: string;
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

function safeParseJson(text: string): any | null {
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

function isValidFrq(q: any) {
  return (
    q &&
    typeof q.unit === "string" &&
    typeof q.type === "string" &&
    typeof q.prompt === "string"
  );
}

export async function POST(req: Request) {
  try {
    const { scope, subject } = (await req.json()) as {
      scope?: string;
      subject?: string;
    };

    const subj = subject ?? "gov";

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    let scopeText = "";

    if (subj === "micro") {
      scopeText =
        scope === "all"
          ? "All of AP Microeconomics"
          : `Unit ${scope} of AP Microeconomics`;
    } else if (subj === "macro") {
      scopeText =
        scope === "all"
          ? "All of AP Macroeconomics"
          : `Unit ${scope} of AP Macroeconomics`;
    } else if (subj === "apes") {
      scopeText =
        scope === "all"
          ? "All of AP Environmental Science"
          : `Unit ${scope} of AP Environmental Science`;
    } else {
      scopeText =
        scope === "all"
          ? "All of AP U.S. Government and Politics"
          : `Unit ${scope} of AP U.S. Government and Politics`;
    }

    const system = `
You are an AP exam writer.

Generate a timed mini section for ${scopeText}.

You MUST return ONLY a valid JSON object with this EXACT structure:
{
  "subject": "string",
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
- FRQs should be realistic AP-style prompts
- Keep FRQs readable, not huge walls of text
- No markdown
- No extra text
- JSON ONLY
`.trim();

    const user =
      subj === "micro"
        ? `Create one 15-question AP Micro mini section for ${scopeText}: 13 MCQs and 2 FRQs.`
        : subj === "macro"
        ? `Create one 15-question AP Macro mini section for ${scopeText}: 13 MCQs and 2 FRQs.`
        : subj === "apes"
        ? `Create one 15-question AP Environmental Science mini section for ${scopeText}: 13 MCQs and 2 FRQs.`
        : `Create one 15-question AP Gov mini section for ${scopeText}: 13 MCQs and 2 FRQs.`;

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

    const parsed = safeParseJson(outputText);

    if (!parsed || !Array.isArray(parsed.mcqs) || !Array.isArray(parsed.frqs)) {
      return NextResponse.json(
        { error: "Invalid mini section format returned", parsed, outputText },
        { status: 500 }
      );
    }

    parsed.mcqs = parsed.mcqs.filter(isValidMcq);
    parsed.frqs = parsed.frqs.filter(isValidFrq);

    if (parsed.mcqs.length > 13) parsed.mcqs = parsed.mcqs.slice(0, 13);
    if (parsed.frqs.length > 2) parsed.frqs = parsed.frqs.slice(0, 2);

    if (parsed.mcqs.length < 13 || parsed.frqs.length < 2) {
      return NextResponse.json(
        {
          error: "Invalid mini section format returned",
          details: {
            mcqCount: parsed.mcqs.length,
            frqCount: parsed.frqs.length,
            parsed,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subject: parsed.subject || subj,
      scope: parsed.scope || scopeText,
      mcqs: parsed.mcqs,
      frqs: parsed.frqs,
    } as MiniSection);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}