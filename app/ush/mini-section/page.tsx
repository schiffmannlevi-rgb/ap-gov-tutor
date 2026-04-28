"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

type FrqGrade = {
  overall_score_0_to_6: number;
  what_to_improve?: string[];
  missing_or_incorrect?: string[];
};

const SCOPE_OPTIONS = [
  { value: "all", label: "APUSH as a whole" },
  { value: "1", label: "Period 1 — 1491–1607" },
  { value: "2", label: "Period 2 — 1607–1754" },
  { value: "3", label: "Period 3 — 1754–1800" },
  { value: "4", label: "Period 4 — 1800–1848" },
  { value: "5", label: "Period 5 — 1844–1877" },
  { value: "6", label: "Period 6 — 1865–1898" },
  { value: "7", label: "Period 7 — 1890–1945" },
  { value: "8", label: "Period 8 — 1945–1980" },
  { value: "9", label: "Period 9 — 1980–Present" },
];

export default function UshMiniSectionPage() {
  const [scope, setScope] = useState("all");
  const [section, setSection] = useState<MiniSection | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [mcqAnswers, setMcqAnswers] = useState<Record<number, "A" | "B" | "C" | "D" | null>>({});
  const [frqAnswers, setFrqAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(1440);
  const [frqGrading, setFrqGrading] = useState(false);
  const [frqResults, setFrqResults] = useState<Record<number, FrqGrade | null>>({});

  useEffect(() => {
    if (!section || submitted) return;

    if (timeLeft <= 0) {
      submitSection();
      return;
    }

    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [section, submitted, timeLeft]);

  const mcqScore = useMemo(() => {
    if (!section || !submitted) return 0;
    return section.mcqs.reduce((sum, q, i) => sum + (mcqAnswers[i] === q.answer ? 1 : 0), 0);
  }, [section, submitted, mcqAnswers]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  async function generateSection() {
    setLoading(true);
    setErr(null);
    setSubmitted(false);
    setSection(null);
    setMcqAnswers({});
    setFrqAnswers({});
    setFrqResults({});
    setTimeLeft(1440);

    try {
      const r = await fetch("/api/mini-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, subject: "ush" }),
      });

      const data = await r.json();

      if (!r.ok) {
        setErr(data?.error || "Request failed");
        return;
      }

      setSection(data);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  async function submitSection() {
    if (!section || submitted) return;

    setSubmitted(true);
    setFrqGrading(true);

    const results: Record<number, FrqGrade | null> = {};

    for (let i = 0; i < section.frqs.length; i++) {
      try {
        const r = await fetch("/api/frq-grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: section.frqs[i].prompt,
            response: frqAnswers[i] || "",
          }),
        });

        const data = await r.json();
        results[i] = r.ok ? data : null;
      } catch {
        results[i] = null;
      }
    }

    setFrqResults(results);
    setFrqGrading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "36px 18px 60px",
        fontFamily: "system-ui",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/ush" style={{ color: "#fff", textDecoration: "none", fontWeight: 800 }}>
          ← Back
        </Link>

        <div
          style={{
            marginTop: 24,
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 24,
            padding: 24,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <h1 style={{ fontSize: 42, margin: 0, fontWeight: 900 }}>
            APUSH Timed Mini Section
          </h1>

          <p style={{ color: "#ccc" }}>
            13 MCQs + 2 writing prompts • 24 minutes
          </p>

          <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 18 }}>
            Timer: {formatTime(timeLeft)}
          </div>

          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            style={{
              background: "#111",
              color: "#fff",
              border: "1px solid #444",
              padding: "10px 12px",
              borderRadius: 12,
              fontWeight: 700,
              marginRight: 12,
            }}
          >
            {SCOPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={generateSection}
            disabled={loading}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #fff",
              background: "#fff",
              color: "#000",
              fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Generating..." : "Start Section"}
          </button>

          {submitted && section && (
            <div style={{ marginTop: 18, fontSize: 22, fontWeight: 900 }}>
              MCQ Score: {mcqScore}/13 {frqGrading ? "• Grading Writing..." : ""}
            </div>
          )}
        </div>

        {err && <div style={{ marginTop: 20, color: "#ffb4b4" }}>{err}</div>}

        {section?.mcqs.map((q, index) => {
          const selected = mcqAnswers[index];

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
              <div style={{ fontWeight: 900, fontSize: 20 }}>
                MCQ {index + 1}
              </div>

              <p style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{q.prompt}</p>

              {(["A", "B", "C", "D"] as const).map((letter) => {
                const isSelected = selected === letter;
                const showCorrect = submitted && q.answer === letter;
                const showWrong = submitted && isSelected && q.answer !== letter;

                return (
                  <button
                    key={letter}
                    onClick={() =>
                      !submitted &&
                      setMcqAnswers((p) => ({ ...p, [index]: letter }))
                    }
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      marginTop: 10,
                      padding: 14,
                      borderRadius: 12,
                      background: isSelected ? "#fff" : "#111",
                      color: isSelected ? "#000" : "#fff",
                      border: showCorrect
                        ? "2px solid rgba(0,255,0,0.65)"
                        : showWrong
                        ? "2px solid rgba(255,0,0,0.65)"
                        : "1px solid rgba(255,255,255,0.14)",
                    }}
                  >
                    <strong>{letter}.</strong> {q.choices[letter]}
                  </button>
                );
              })}

              {submitted && (
                <p style={{ color: "#ccc" }}>
                  Correct: {q.answer}. {q.explanation}
                </p>
              )}
            </div>
          );
        })}

        {section?.frqs.map((frq, index) => (
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
            <div style={{ fontWeight: 900, fontSize: 20 }}>
              Prompt {index + 1} — {frq.type}
            </div>

            <p style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {frq.prompt}
            </p>

            <textarea
              disabled={submitted}
              value={frqAnswers[index] || ""}
              onChange={(e) =>
                setFrqAnswers((p) => ({ ...p, [index]: e.target.value }))
              }
              rows={8}
              placeholder="Write your response here..."
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                background: "#111",
                color: "#fff",
                border: "1px solid #333",
                lineHeight: 1.5,
              }}
            />

            {submitted && (
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "#111",
                }}
              >
                {frqGrading ? (
                  <strong>Grading...</strong>
                ) : frqResults[index] ? (
                  <>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>
                      Score: {frqResults[index]?.overall_score_0_to_6}/6
                    </div>

                    {frqResults[index]?.what_to_improve?.length ? (
                      <div style={{ marginTop: 12 }}>
                        <strong>What to improve</strong>
                        <ul>
                          {frqResults[index]?.what_to_improve?.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {frqResults[index]?.missing_or_incorrect?.length ? (
                      <div style={{ marginTop: 12 }}>
                        <strong>Missing or incorrect</strong>
                        <ul>
                          {frqResults[index]?.missing_or_incorrect?.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <strong>Grading failed.</strong>
                )}
              </div>
            )}
          </div>
        ))}

        {section && !submitted && (
          <button
            onClick={submitSection}
            style={{
              marginTop: 24,
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid #fff",
              background: "#fff",
              color: "#000",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Submit Section
          </button>
        )}
      </div>
    </main>
  );
}