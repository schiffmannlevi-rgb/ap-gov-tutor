import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, selected } = (await req.json()) as {
      question?: {
        answer?: "A" | "B" | "C" | "D";
        explanation?: string;
      };
      selected?: "A" | "B" | "C" | "D";
    };

    if (!question?.answer || !selected) {
      return NextResponse.json(
        { error: "Missing question.answer or selected" },
        { status: 400 }
      );
    }

    const correct = selected === question.answer;

    return NextResponse.json({
      correct,
      correctAnswer: question.answer,
      explanation: `${
        correct ? "Correct. " : `Incorrect. Correct answer is ${question.answer}. `
      }${question.explanation ?? ""}`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}