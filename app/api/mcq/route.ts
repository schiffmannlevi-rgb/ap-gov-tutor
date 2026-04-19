import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Mcq = {
  subject: "gov" | "micro";
  unit: string;
  prompt: string;
  choices: { A: string; B: string; C: string; D: string };
  answer: "A" | "B" | "C" | "D";
  explanation: string;
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
    (q.subject === "gov" || q.subject === "micro") &&
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      unit?: string;
      subject?: "gov" | "micro";
      count?: number;
    };

    const subject = body.subject ?? "gov";
    const unit = body.unit ?? "any";
    const count = Math.max(5, Math.min(Number(body.count ?? 5), 10));

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment variables" },
        { status: 500 }
      );
    }

    let system = "";

    if (subject === "micro") {
      system = `
You are an AP Microeconomics exam question writer.

Generate EXACTLY ${count} high-quality AP Microeconomics multiple-choice questions.

Requirements:
- Must be application-based, not just vocabulary definitions
- Use realistic economic scenarios
- Test reasoning about incentives, costs, revenue, profit, elasticity, policy, market structure, or efficiency
- Feel like real AP Micro questions, not basic quizzes
- Use plausible distractors

Topics may include:
- basic economic concepts
- supply and demand
- elasticity
- consumer and producer surplus
- costs and production
- revenue and profit
- perfect competition
- monopoly
- monopolistic competition
- oligopoly
- factor markets
- externalities and government intervention

Return ONLY a valid JSON object with this EXACT structure:
{
  "questions": [
    {
      "subject": "micro",
      "unit": "${unit}",
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
  ]
}

Rules:
- Return EXACTLY ${count} questions
- No markdown
- No extra text
- JSON ONLY
`.trim();
    } else {
      system = `
You are an AP U.S. Government & Politics exam question writer.

Generate EXACTLY ${count} high-quality AP Gov multiple-choice questions.

Requirements:
- Must be application-based, not just vocabulary definitions
- Use realistic political, constitutional, institutional, or civic scenarios
- Feel like real AP Gov MCQs
- Use plausible distractors

Topics may include:
- constitutional foundations
- federalism
- separation of powers
- checks and balances
- Congress, presidency, bureaucracy, courts
- civil liberties and civil rights
- ideology and political beliefs
- elections, parties, participation, media, and interest groups

Return ONLY a valid JSON object with this EXACT structure:
{
  "questions": [
    {
      "subject": "gov",
      "unit": "${unit}",
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
  ]
}

Rules:
- Return EXACTLY ${count} questions
- No markdown
- No extra text
- JSON ONLY
`.trim();
    }

    const user =
      subject === "micro"
        ? `Create ${count} challenging AP Microeconomics multiple-choice questions for unit ${unit}.`
        : `Create ${count} challenging AP Government multiple-choice questions for unit ${unit}.`;

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
        max_output_tokens: 5000,
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

    const parsed = safeParseJsonObject(outputText) as { questions?: Mcq[] } | null;

    if (!parsed || !Array.isArray(parsed.questions)) {
      return NextResponse.json(
        { error: "Could not parse questions JSON", outputText },
        { status: 500 }
      );
    }

    const validQuestions = parsed.questions.filter(isValidMcq).slice(0, count);

    if (validQuestions.length < 5) {
      return NextResponse.json(
        {
          error: "Invalid MCQ format returned",
          details: { questionCount: validQuestions.length, parsed },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: validQuestions });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}