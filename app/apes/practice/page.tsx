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

const APES_UNITS = [
  { value: "1", label: "Unit 1 — The Living World: Ecosystems" },
  { value: "2", label: "Unit 2 — The Living World: Biodiversity" },
  { value: "3", label: "Unit 3 — Populations" },
  { value: "4", label: "Unit 4 — Earth Systems and Resources" },
  { value: "5", label: "Unit 5 — Land and Water Use" },
  { value: "6", label: "Unit 6 — Energy Resources and Consumption" },
  { value: "7", label: "Unit 7 — Atmospheric Pollution" },
  { value: "8", label: "Unit 8 — Aquatic and Terrestrial Pollution" },
  { value: "9", label: "Unit 9 — Global Change" },
  { value: "any", label: "Any Unit" },
];

export default function ApesPracticePage() {
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
        body: JSON.stringify({ subject: "apes", unit, count: 5 }),
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

  function checkAll() {
    setChecked(true);
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
          href="/apes"
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
          APES Practice
        </h1>

        <p style={{ color: "#d6d6d6", marginBottom: 24, lineHeight: 1.5 }}>
          Generate AP Environmental Science multiple-choice questions using realistic
          environmental scenarios and AP-style reasoning.
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
            {APES_UNITS.map((u) => (
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

              <div style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 16 }}>
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
                  <p style={{ marginTop: 10, lineHeight: 1.6 }}>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}

        {questions.length > 0 && !checked && (
          <button
            onClick={checkAll}
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