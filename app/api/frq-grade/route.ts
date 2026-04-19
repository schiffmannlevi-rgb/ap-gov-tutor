import { NextResponse } from "next/server";

type GradeRequest = {
  prompt: string;
  response: string;
};

function extractOutputText(data: any): string | null {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const out = data?.output;
  if (Array.isArray(out)) {
    const chunks: string[] = [];
    for (const msg of out) {
      const content = msg?.content;
      if (!Array.isArray(content)) continue;

      for (const item of content) {
        if (typeof item?.text === "string" && item.text.trim()) {
          chunks.push(item.text);
        }
        if (typeof item?.value === "string" && item.value.trim()) {
          chunks.push(item.value);
        }
      }
    }
    if (chunks.length) return chunks.join("\n");
  }

  return null;
}

function safeParseJson(text: string): any {
  let t = text.trim();

  t = t.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

  const firstBrace = t.indexOf("{");
  const lastBrace = t.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    t = t.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(t);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GradeRequest;

    if (!body?.prompt || !body?.response) {
      return NextResponse.json(
        { error: "Missing prompt or response" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    const system = `
You are an AP free-response grader.

Your job is to grade the student response like a strict but fair AP reader.

IMPORTANT RULES:
- Do NOT write a model rewrite.
- Do NOT include chain-of-thought or hidden reasoning.
- Focus on scoring and actionable rubric-based feedback.
- Return ONLY valid JSON.
`;

    const user = `
FRQ PROMPT:
${body.prompt}

STUDENT RESPONSE:
${body.response}

Return JSON with EXACTLY this shape:
{
  "overall_score_0_to_6": number,
  "breakdown": {
    "thesis_claim_0_to_1": number,
    "evidence_0_to_2": number,
    "reasoning_0_to_2": number,
    "accuracy_precision_0_to_1": number
  },
  "what_was_done_well": ["string"],
  "what_to_improve": ["string"],
  "missing_or_incorrect": ["string"]
}

Grading expectations:
- thesis_claim_0_to_1: clear defensible claim if applicable
- evidence_0_to_2: relevant and specific evidence
- reasoning_0_to_2: explanation, linkage, analysis
- accuracy_precision_0_to_1: factual accuracy and precision

Feedback rules:
- "what_was_done_well" should be short and specific
- "what_to_improve" should be short, actionable, and realistic
- "missing_or_incorrect" should identify specific missing content, vague reasoning, or incorrect claims
- No rewrite suggestion
- No extra keys
`;

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
        text: { format: { type: "json_object" } },
        reasoning: { effort: "low" },
        max_output_tokens: 2200,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return NextResponse.json(
        { error: "OpenAI request failed", details: errText },
        { status: 500 }
      );
    }

    const data = await r.json();
    const outputText = extractOutputText(data);

    if (!outputText) {
      return NextResponse.json(
        { error: "No output text returned from model", raw: data },
        { status: 500 }
      );
    }

    let parsed: any;
    try {
      parsed = safeParseJson(outputText);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON", outputText, raw: data },
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