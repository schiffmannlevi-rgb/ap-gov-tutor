"use client";

import Link from "next/link";
import { useState } from "react";

type Mcq = {
  subject?: string;
  unit: string;
  prompt: string;
  choices: { A: string; B: string; C: string; D: string };
  answer: "A" | "B" | "C" | "D";
  explanation: string;
};

const MICRO_UNITS = [
  { value: "1", label: "Unit 1 — Basic Economic Concepts" },
  { value: "2", label: "Unit 2 — Supply and Demand" },
  { value: "3", label: "Unit 3 — Production, Cost, and Perfect Competition" },
  { value: "4", label: "Unit 4 — Imperfect Competition" },
  { value: "5", label: "Unit 5 — Factor Markets" },
  { value: "6", label: "Unit 6 — Market Failure and the Role of Government" },
  { value: "any", label: "Any Unit" },
];

export default function MicroPracticePage() {
  const [unit, setUnit] = useState("any");
  const [question, setQuestion] = useState<Mcq | null>(null);
  const [selected, setSelected] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateQuestion() {
    setLoading(true);
    setSelected(null);
    setFeedback("");
    setError("");
    setQuestion(null);

    try {
      const res = await fetch("/api/mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "micro",
          unit,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to generate question");
        return;
      }

      setQuestion(data);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  async function checkAnswer() {
    if (!question || !selected) return;

    try {
      const res = await fetch("/api/mcq/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          selected,
        }),
      });

      const data = await res.json();
      setFeedback(data.explanation || "No explanation returned.");
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: 40,
        fontFamily: "system-ui",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link
          href="/micro"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "#fff",
            fontWeight: 800,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 20 }}>←</span>
          <span>Back</span>
        </Link>

        <h1 style={{ fontSize: 42, marginBottom: 8, fontWeight: 900 }}>
          AP Micro Practice
        </h1>

        <p style={{ color: "#d6d6d6", marginBottom: 24, lineHeight: 1.5 }}>
          Generate AP Micro multiple-choice questions using realistic economic
          scenarios and AP-style reasoning.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            style={{
              background: "#111",
              color: "#fff",
              border: "1px solid #444",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            {MICRO_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>

          <button
            onClick={generateQuestion}
            disabled={loading}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #fff",
              background: "#fff",
              color: "#000",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Generating..." : "Generate Question"}
          </button>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: 14,
              borderRadius: 12,
              border: "1px solid rgba(255,80,80,0.5)",
              background: "rgba(255,80,80,0.12)",
              color: "#ffd4d4",
            }}
          >
            {error}
          </div>
        )}

        {question && (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 18,
              padding: 20,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>
              Question
            </div>

            <div style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 16 }}>
              {question.prompt}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {(["A", "B", "C", "D"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  style={{
                    display: "block",
                    textAlign: "left",
                    padding: 14,
                    width: "100%",
                    background: selected === key ? "#fff" : "#111",
                    color: selected === key ? "#000" : "#fff",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 12,
                    cursor: "pointer",
                    lineHeight: 1.5,
                  }}
                >
                  <strong>{key}.</strong> {question.choices[key]}
                </button>
              ))}
            </div>

            <button
              onClick={checkAnswer}
              disabled={!selected}
              style={{
                marginTop: 18,
                padding: "12px 16px",
                fontWeight: 800,
                borderRadius: 10,
                border: "1px solid #fff",
                background: !selected ? "#333" : "#fff",
                color: !selected ? "#bbb" : "#000",
                cursor: !selected ? "not-allowed" : "pointer",
              }}
            >
              Check Answer
            </button>

            {feedback && (
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "#0b0b0b",
                }}
              >
                <strong>Explanation:</strong>
                <p style={{ marginTop: 10, lineHeight: 1.6 }}>{feedback}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}