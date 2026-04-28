"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Mcq = {
  subject?: string;
  unit: string;
  prompt: string;
  choices: { A: string; B: string; C: string; D: string };
  answer: "A" | "B" | "C" | "D";
  explanation: string;
};

const UNITS = [
  { value: "1", label: "Period 1 — 1491–1607" },
  { value: "2", label: "Period 2 — 1607–1754" },
  { value: "3", label: "Period 3 — 1754–1800" },
  { value: "4", label: "Period 4 — 1800–1848" },
  { value: "5", label: "Period 5 — 1844–1877" },
  { value: "6", label: "Period 6 — 1865–1898" },
  { value: "7", label: "Period 7 — 1890–1945" },
  { value: "8", label: "Period 8 — 1945–1980" },
  { value: "9", label: "Period 9 — 1980–Present" },
  { value: "any", label: "Any Period" },
];

export default function UshPracticePage() {
  const [unit, setUnit] = useState("any");
  const [questions, setQuestions] = useState<Mcq[]>([]);
  const [selected, setSelected] = useState<Record<number, "A" | "B" | "C" | "D" | null>>({});
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const answeredCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  );

  const score = checked
    ? questions.reduce((sum, q, i) => sum + (selected[i] === q.answer ? 1 : 0), 0)
    : 0;

  async function generate() {
    setLoading(true);
    setErr(null);
    setChecked(false);
    setSelected({});
    setQuestions([]);

    try {
      const res = await fetch("/api/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "ush", unit, count: 5 }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data?.error || "Failed to generate questions");
        return;
      }

      setQuestions(data.questions || []);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  function choose(index: number, answer: "A" | "B" | "C" | "D") {
    if (checked) return;
    setSelected((prev) => ({ ...prev, [index]: answer }));
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
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Link
          href="/ush"
          style={{
            display: "inline-flex",
            gap: 8,
            textDecoration: "none",
            color: "#fff",
            fontWeight: 800,
            marginBottom: 24,
          }}
        >
          ← Back
        </Link>

        <h1 style={{ fontSize: 42, marginBottom: 8, fontWeight: 900 }}>
          APUSH Practice
        </h1>

        <p style={{ color: "#d6d6d6", marginBottom: 24, lineHeight: 1.5 }}>
          Generate AP U.S. History multiple-choice questions using historical
          scenarios, interpretation, causation, comparison, and continuity/change.
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
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>

          <button
            onClick={generate}
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
            {loading ? "Generating..." : "Generate 5 Questions"}
          </button>
        </div>

        {err && (
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
            {err}
          </div>
        )}

        {checked && questions.length > 0 && (
          <div
            style={{
              marginBottom: 22,
              padding: 18,
              borderRadius: 16,
              border: "1px solid #333",
              background: "#0a0a0a",
              fontWeight: 900,
              fontSize: 22,
            }}
          >
            Score: {score}/{questions.length}
          </div>
        )}

        {questions.map((q, index) => {
          const selectedAnswer = selected[index];
          const correct = selectedAnswer === q.answer;

          return (
            <div
              key={index}
              style={{
                marginTop: 22,
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 18,
                padding: 20,
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>
                Question {index + 1}
              </div>

              <div style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 16, whiteSpace: "pre-wrap" }}>
                {q.prompt}
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {(["A", "B", "C", "D"] as const).map((key) => {
                  const isSelected = selectedAnswer === key;
                  const showCorrect = checked && q.answer === key;
                  const showWrong = checked && isSelected && q.answer !== key;

                  return (
                    <button
                      key={key}
                      onClick={() => choose(index, key)}
                      style={{
                        display: "block",
                        textAlign: "left",
                        padding: 14,
                        width: "100%",
                        background: isSelected ? "#fff" : "#111",
                        color: isSelected ? "#000" : "#fff",
                        border: showCorrect
                          ? "2px solid rgba(0,255,0,0.65)"
                          : showWrong
                          ? "2px solid rgba(255,0,0,0.65)"
                          : "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 12,
                        cursor: checked ? "default" : "pointer",
                        lineHeight: 1.5,
                      }}
                    >
                      <strong>{key}.</strong> {q.choices[key]}
                    </button>
                  );
                })}
              </div>

              {checked && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    borderRadius: 14,
                    border: correct
                      ? "1px solid rgba(0,255,0,0.4)"
                      : "1px solid rgba(255,0,0,0.4)",
                    background: correct
                      ? "rgba(0,255,0,0.07)"
                      : "rgba(255,0,0,0.07)",
                  }}
                >
                  <strong>
                    {correct ? "Correct" : "Incorrect"} (Correct: {q.answer})
                  </strong>
                  <p style={{ marginTop: 10, lineHeight: 1.6 }}>
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {questions.length > 0 && !checked && (
          <button
            onClick={() => setChecked(true)}
            disabled={answeredCount !== questions.length}
            style={{
              marginTop: 24,
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid #fff",
              background: answeredCount === questions.length ? "#fff" : "#333",
              color: answeredCount === questions.length ? "#000" : "#bbb",
              fontWeight: 900,
              cursor: answeredCount === questions.length ? "pointer" : "not-allowed",
            }}
          >
            Submit Answers
          </button>
        )}
      </div>
    </main>
  );
}