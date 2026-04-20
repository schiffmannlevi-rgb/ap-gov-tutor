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
  { value: "all", label: "AP Macro as a whole" },
  { value: "1", label: "Unit 1" },
  { value: "2", label: "Unit 2" },
  { value: "3", label: "Unit 3" },
  { value: "4", label: "Unit 4" },
  { value: "5", label: "Unit 5" },
  { value: "6", label: "Unit 6" },
];

export default function MacroMiniSectionPage() {
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

    const id = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

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
        body: JSON.stringify({ scope, subject: "macro" }),
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

  function setMcqAnswer(index: number, answer: "A" | "B" | "C" | "D") {
    if (submitted) return;
    setMcqAnswers((prev) => ({ ...prev, [index]: answer }));
  }

  function setFrqAnswer(index: number, value: string) {
    if (submitted) return;
    setFrqAnswers((prev) => ({ ...prev, [index]: value }));
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
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link
          href="/macro"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
            textDecoration: "none",
            color: "#fff",
            fontWeight: 800,
            opacity: 0.9,
          }}
        >
          <span style={{ fontSize: 20 }}>←</span>
          <span>Back</span>
        </Link>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 24,
            padding: 24,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.22)",
                  fontSize: 12,
                  color: "#d9d9d9",
                  marginBottom: 14,
                }}
              >
                AP Macro Timed Drill
              </div>

              <h1
                style={{
                  fontSize: 42,
                  margin: "0 0 10px",
                  fontWeight: 900,
                }}
              >
                Timed Mini Section
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#d8d8d8",
                  lineHeight: 1.55,
                  maxWidth: 720,
                  fontSize: 17,
                }}
              >
                Take a 24-minute AP Macro drill with 13 multiple-choice questions
                and 2 free-response questions.
              </p>
            </div>

            <div
              style={{
                minWidth: 170,
                padding: "16px 18px",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.04)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 12, color: "#cfcfcf", marginBottom: 6 }}>
                Timer
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 900,
                  color: timeLeft <= 120 ? "#ff7b7b" : "#ffffff",
                }}
              >
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label style={{ fontWeight: 800, color: "#f3f3f3" }}>Scope</label>

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
                minWidth: 220,
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
          </div>

          {submitted && section && (
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
              MCQ Score: {mcqScore}/13 {frqGrading ? "• Grading FRQs..." : ""}
            </div>
          )}
        </div>

        {err && (
          <div
            style={{
              marginTop: 22,
              background: "rgba(255,0,0,0.10)",
              border: "1px solid rgba(255,0,0,0.35)",
              padding: 16,
              borderRadius: 16,
              fontWeight: 700,
            }}
          >
            {err}
          </div>
        )}

        {section &&
          section.mcqs.map((q, index) => {
            const selectedAnswer = mcqAnswers[index];
            const correct = selectedAnswer === q.answer;

            return (
              <div
                key={`mcq-${index}`}
                style={{
                  marginTop: 22,
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 22,
                  padding: 20,
                  background: "rgba(255,255,255,0.035)",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
                  MCQ {index + 1}
                </div>

                <div style={{ fontSize: 18, lineHeight: 1.6 }}>{q.prompt}</div>

                <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                  {(["A", "B", "C", "D"] as const).map((letter) => {
                    const isSelected = selectedAnswer === letter;
                    const showCorrect = submitted && q.answer === letter;
                    const showWrong = submitted && isSelected && q.answer !== letter;

                    return (
                      <button
                        key={letter}
                        onClick={() => setMcqAnswer(index, letter)}
                        style={{
                          textAlign: "left",
                          padding: "14px 16px",
                          borderRadius: 14,
                          border: showCorrect
                            ? "2px solid rgba(0,255,0,0.65)"
                            : showWrong
                            ? "2px solid rgba(255,0,0,0.65)"
                            : "1px solid rgba(255,255,255,0.16)",
                          background: isSelected ? "#fff" : "rgba(255,255,255,0.035)",
                          color: isSelected ? "#000" : "#fff",
                          cursor: submitted ? "default" : "pointer",
                          lineHeight: 1.45,
                        }}
                      >
                        <strong>{letter}.</strong> {q.choices[letter]}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div
                    style={{
                      marginTop: 16,
                      borderRadius: 16,
                      border: correct
                        ? "1px solid rgba(0,255,0,0.4)"
                        : "1px solid rgba(255,0,0,0.4)",
                      padding: 16,
                      background: correct
                        ? "rgba(0,255,0,0.07)"
                        : "rgba(255,0,0,0.07)",
                    }}
                  >
                    <strong>
                      {correct ? "Correct" : "Incorrect"} (Correct: {q.answer})
                    </strong>
                    <div style={{ marginTop: 8, lineHeight: 1.65 }}>{q.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}

        {section &&
          section.frqs.map((frq, index) => (
            <div
              key={`frq-${index}`}
              style={{
                marginTop: 22,
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 22,
                padding: 20,
                background: "rgba(255,255,255,0.035)",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
                FRQ {index + 1} — {frq.type}
              </div>

              <div style={{ fontSize: 18, lineHeight: 1.6 }}>{frq.prompt}</div>

              <textarea
                value={frqAnswers[index] || ""}
                onChange={(e) => setFrqAnswer(index, e.target.value)}
                disabled={submitted}
                rows={8}
                placeholder="Write your response here..."
                style={{
                  width: "100%",
                  marginTop: 18,
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "#101010",
                  color: "#fff",
                  fontSize: 16,
                  lineHeight: 1.5,
                  resize: "vertical",
                }}
              />

              {submitted && (
                <div
                  style={{
                    marginTop: 16,
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.14)",
                    padding: 16,
                    background: "#111",
                  }}
                >
                  {frqGrading ? (
                    <strong>Grading FRQ...</strong>
                  ) : frqResults[index] ? (
                    <>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>
                        Score: {frqResults[index]?.overall_score_0_to_6}/6
                      </div>

                      {frqResults[index]?.what_to_improve?.length ? (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontWeight: 800, marginBottom: 8 }}>
                            What to improve
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
                            {frqResults[index]?.what_to_improve?.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {frqResults[index]?.missing_or_incorrect?.length ? (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontWeight: 800, marginBottom: 8 }}>
                            Missing or incorrect
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
                            {frqResults[index]?.missing_or_incorrect?.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <strong>FRQ grading failed.</strong>
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
              padding: "12px 16px",
              borderRadius: 14,
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