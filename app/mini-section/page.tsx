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
  mcqs: Mcq[];
  frqs: Frq[];
};

type FrqGrade = {
  overall_score_0_to_6: number;
  breakdown?: {
    thesis_claim_0_to_1?: number;
    evidence_0_to_2?: number;
    reasoning_0_to_2?: number;
    accuracy_precision_0_to_1?: number;
  };
  what_was_done_well?: string[];
  what_to_improve?: string[];
  missing_or_incorrect?: string[];
  rewrite_suggestion?: string;
};

const SCOPE_OPTIONS = [
  { value: "all", label: "AP Gov as a whole" },
  { value: "1", label: "Unit 1" },
  { value: "2", label: "Unit 2" },
  { value: "3", label: "Unit 3" },
  { value: "4", label: "Unit 4" },
  { value: "5", label: "Unit 5" },
];

export default function MiniSectionPage() {
  const [scope, setScope] = useState("all");
  const [section, setSection] = useState<MiniSection | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [mcqAnswers, setMcqAnswers] = useState<Record<number, "A" | "B" | "C" | "D" | null>>({});
  const [frqAnswers, setFrqAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(360); // 6 minutes
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
    return section.mcqs.reduce((sum, q, i) => {
      return sum + (mcqAnswers[i] === q.answer ? 1 : 0);
    }, 0);
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
    setTimeLeft(360);

    try {
      const r = await fetch("/api/mini-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
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

    // Auto-grade the 2 FRQs after submission
    setFrqGrading(true);
    const results: Record<number, FrqGrade | null> = {};

    for (let i = 0; i < section.frqs.length; i++) {
      const frq = section.frqs[i];
      const response = frqAnswers[i] || "";

      try {
        const r = await fetch("/api/frq-grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: frq.prompt,
            response,
          }),
        });

        const data = await r.json();

        if (r.ok) {
          results[i] = data;
        } else {
          results[i] = null;
        }
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
        padding: "40px 18px",
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

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 42, margin: 0, fontWeight: 900 }}>
          Timed Mini Section
        </h1>
        <p style={{ opacity: 0.85, marginTop: 10 }}>
          13 MCQs + 2 FRQs in 6 minutes.
        </p>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label style={{ fontWeight: 700 }}>Scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            style={{
              background: "#111",
              color: "#fff",
              border: "1px solid #444",
              padding: "8px 10px",
              borderRadius: 10,
              fontWeight: 700,
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
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #fff",
              background: "#fff",
              color: "#000",
              fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Generating..." : "Start 6-Minute Section"}
          </button>

          {section && (
            <div
              style={{
                marginLeft: "auto",
                fontSize: 24,
                fontWeight: 900,
                color: timeLeft <= 60 ? "#ff6b6b" : "#fff",
              }}
            >
              {formatTime(timeLeft)}
            </div>
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

        {!section && !err && (
          <div style={{ marginTop: 22, opacity: 0.85, fontWeight: 600 }}>
            Generate a timed set to begin.
          </div>
        )}

        {section && (
          <>
            {section.mcqs.map((q, index) => {
              const selectedAnswer = mcqAnswers[index];
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
                    MCQ {index + 1}
                  </div>
                  <div style={{ fontSize: 18, lineHeight: 1.5 }}>{q.prompt}</div>

                  <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                    {(["A", "B", "C", "D"] as const).map((letter) => {
                      const isSelected = selectedAnswer === letter;
                      const showCorrect = submitted && q.answer === letter;
                      const showWrong =
                        submitted && isSelected && q.answer !== letter;

                      return (
                        <button
                          key={letter}
                          onClick={() => setMcqAnswer(index, letter)}
                          style={{
                            textAlign: "left",
                            padding: "14px",
                            borderRadius: 14,
                            border: "1px solid #333",
                            background: isSelected ? "#fff" : "#0a0a0a",
                            color: isSelected ? "#000" : "#fff",
                            cursor: submitted ? "default" : "pointer",
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

                  {submitted && (
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

            {section.frqs.map((frq, index) => (
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
                  FRQ {index + 1} — {frq.type}
                </div>
                <div style={{ fontSize: 18, lineHeight: 1.5 }}>{frq.prompt}</div>

                <textarea
                  value={frqAnswers[index] || ""}
                  onChange={(e) => setFrqAnswer(index, e.target.value)}
                  rows={8}
                  disabled={submitted}
                  placeholder="Write your response here..."
                  style={{
                    width: "100%",
                    marginTop: 16,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #444",
                    background: "#111",
                    color: "#fff",
                    fontSize: 16,
                  }}
                />

                {submitted && (
                  <div
                    style={{
                      marginTop: 16,
                      borderRadius: 16,
                      border: "1px solid #333",
                      padding: 16,
                      background: "#111",
                    }}
                  >
                    {frqGrading ? (
                      <strong>Grading FRQ...</strong>
                    ) : frqResults[index] ? (
                      <>
                        <strong>
                          AI Score: {frqResults[index]?.overall_score_0_to_6}/6
                        </strong>
                        <div style={{ marginTop: 10, lineHeight: 1.6 }}>
                          {frqResults[index]?.what_to_improve?.length ? (
                            <>
                              <div style={{ fontWeight: 800 }}>What to improve:</div>
                              <ul>
                                {frqResults[index]?.what_to_improve?.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </>
                          ) : null}

                          {frqResults[index]?.rewrite_suggestion ? (
                            <>
                              <div style={{ fontWeight: 800, marginTop: 10 }}>
                                Rewrite suggestion:
                              </div>
                              <div>{frqResults[index]?.rewrite_suggestion}</div>
                            </>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <strong>FRQ grading failed.</strong>
                    )}
                  </div>
                )}
              </div>
            ))}

            {!submitted && (
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

            {submitted && (
              <div
                style={{
                  marginTop: 24,
                  padding: 18,
                  borderRadius: 16,
                  border: "1px solid #333",
                  background: "#0a0a0a",
                  fontWeight: 900,
                  fontSize: 22,
                }}
              >
                MCQ Score: {mcqScore}/13
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}