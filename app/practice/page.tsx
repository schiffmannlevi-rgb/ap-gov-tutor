"use client";

import Link from "next/link";
import { useState } from "react";

type Mcq = {
  unit: string;
  prompt: string;
  choices: { A: string; B: string; C: string; D: string };
  answer: "A" | "B" | "C" | "D";
  explanation: string;
};

const UNITS: { value: string; label: string }[] = [
  { value: "1", label: "Unit 1 — Foundations" },
  { value: "2", label: "Unit 2 — Interactions Among Branches" },
  { value: "3", label: "Unit 3 — Civil Liberties & Rights" },
  { value: "4", label: "Unit 4 — Ideologies & Beliefs" },
  { value: "5", label: "Unit 5 — Political Participation" },
];

export default function PracticePage() {
  const [unit, setUnit] = useState("1");
  const [questions, setQuestions] = useState<Mcq[]>([]);
  const [selected, setSelected] = useState<Record<number, "A" | "B" | "C" | "D" | null>>({});
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setErr(null);
    setChecked(false);
    setSelected({});
    setQuestions([]);

    try {
      const r = await fetch("/api/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit }),
      });

      const data = await r.json();

      if (!r.ok) {
        const msg =
          data?.details?.error?.message ||
          data?.details?.message ||
          data?.error ||
          "Request failed";
        setErr(String(msg));
        return;
      }

      setQuestions(data.questions || []);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  function setAnswer(index: number, answer: "A" | "B" | "C" | "D") {
    if (checked) return;
    setSelected((prev) => ({ ...prev, [index]: answer }));
  }

  function checkAll() {
    setChecked(true);
  }

  const answeredCount = Object.values(selected).filter(Boolean).length;
  const score = checked
    ? questions.reduce((sum, q, i) => sum + (selected[i] === q.answer ? 1 : 0), 0)
    : 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "48px 18px",
        fontFamily:
          'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
          textDecoration: "none",
          color: "#fff",
          fontWeight: 800,
          opacity: 0.9,
        }}
      >
        <span style={{ fontSize: 20 }}>←</span>
        <span>Back</span>
      </Link>

      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 44, margin: 0, fontWeight: 900 }}>
            Practice
          </h1>
          <div style={{ opacity: 0.85, fontWeight: 600 }}>
            {UNITS.find((u) => u.value === unit)?.label}
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label style={{ fontWeight: 700 }}>Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            style={{
              background: "#111",
              color: "#fff",
              border: "1px solid #444",
              padding: "8px 10px",
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
              marginLeft: 8,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #fff",
              background: "#fff",
              color: "#000",
              fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Generating..." : "Generate 5 Questions"}
          </button>

          {questions.length > 0 && !checked && (
            <button
              onClick={checkAll}
              disabled={answeredCount !== questions.length}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #fff",
                background: answeredCount === questions.length ? "#fff" : "#333",
                color: answeredCount === questions.length ? "#000" : "#bbb",
                fontWeight: 900,
                cursor: answeredCount === questions.length ? "pointer" : "not-allowed",
              }}
            >
              Check All Answers
            </button>
          )}
        </div>

        {err && (
          <div
            style={{
              marginTop: 18,
              background: "rgba(255,0,0,0.10)",
              border: "1px solid rgba(255,0,0,0.35)",
              padding: 16,
              borderRadius: 14,
              fontWeight: 700,
            }}
          >
            <div style={{ marginBottom: 6 }}>Error</div>
            <div style={{ opacity: 0.9 }}>{err}</div>
          </div>
        )}

        {questions.length === 0 && !err && (
          <div style={{ marginTop: 22, opacity: 0.85, fontWeight: 600 }}>
            Click <b>Generate 5 Questions</b> to start.
          </div>
        )}

        {checked && questions.length > 0 && (
          <div
            style={{
              marginTop: 22,
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
                border: "1px solid #333",
                borderRadius: 16,
                padding: 18,
                background: "#0a0a0a",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>
                Question {index + 1}
              </div>
              <div style={{ fontSize: 18, lineHeight: 1.5 }}>{q.prompt}</div>

              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                {(["A", "B", "C", "D"] as const).map((letter) => {
                  const isSelected = selectedAnswer === letter;
                  const showCorrect = checked && q.answer === letter;
                  const showWrong = checked && isSelected && q.answer !== letter;

                  return (
                    <button
                      key={letter}
                      onClick={() => setAnswer(index, letter)}
                      style={{
                        textAlign: "left",
                        padding: "14px",
                        borderRadius: 14,
                        border: "1px solid #333",
                        background: isSelected ? "#fff" : "#0a0a0a",
                        color: isSelected ? "#000" : "#fff",
                        cursor: checked ? "default" : "pointer",
                        outline: showCorrect
                          ? "2px solid rgba(0,255,0,0.65)"
                          : showWrong
                          ? "2px solid rgba(255,0,0,0.65)"
                          : "none",
                      }}
                    >
                      <strong>{letter}.</strong> {q.choices[letter]}
                    </button>
                  );
                })}
              </div>

              {checked && (
                <div
                  style={{
                    marginTop: 16,
                    borderRadius: 16,
                    border: "1px solid #333",
                    padding: 16,
                    background: "#111",
                  }}
                >
                  <strong>
                    {correct ? " Correct" : " Incorrect"} (Correct: {q.answer})
                  </strong>
                  <div style={{ marginTop: 8, lineHeight: 1.6 }}>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}