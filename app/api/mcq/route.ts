import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Mcq = {
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

function isValidQuestion(q: any) {
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

export async function POST(req: Request) {
  try {
    const { unit } = (await req.json()) as { unit?: string };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const system = `
You are an AP U.S. Government & Politics exam question writer.

Generate EXACTLY FIVE high-quality AP-style multiple-choice questions.

The questions MUST:
- Be realistic for an AP Government and Politics exam
- Be application-based, not just vocabulary definitions
- Include short scenarios, institutional examples, political situations, or constitutional contexts
- Test reasoning and conceptual understanding
- Focus on major AP Gov content such as:
  - federalism
  - separation of powers
  - checks and balances
  - Congress, presidency, bureaucracy, courts
  - civil liberties and civil rights
  - political ideology and public opinion
  - elections, participation, parties, and interest groups
  - foundational documents and landmark Supreme Court cases

Choices must:
- Be plausible
- Be similar in length and tone
- Include realistic misconceptions as distractors
- Have exactly ONE clearly correct answer

Each explanation must:
- Explain why the correct answer is right
- Briefly explain why at least one tempting distractor is wrong
- Sound like an AP Gov tutor, not a robot

Return ONLY a valid JSON OBJECT with this EXACT structure:
{
  "questions": [
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
  ]
}

Rules:
- There must be EXACTLY 5 questions
- Prompt should be 1–3 sentences each
- Do NOT use markdown
- Do NOT include extra text
- JSON ONLY
`.trim();

    const user = `Create five challenging AP Gov multiple-choice questions for Unit ${unit ?? "1"}. Make them feel like real exam questions, not basic class quizzes.`;

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
        max_output_tokens: 4000,
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

    const parsed = safeParseJsonObject(outputText) as
      | { questions?: Mcq[] }
      | null;

    if (!parsed || !Array.isArray(parsed.questions)) {
      return NextResponse.json(
        { error: "Could not parse questions JSON", outputText },
        { status: 500 }
      );
    }

    if (parsed.questions.length !== 5 || !parsed.questions.every(isValidQuestion)) {
      return NextResponse.json(
        { error: "Invalid MCQ format returned", parsed },
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