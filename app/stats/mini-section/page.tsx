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

const SCOPE_OPTIONS = [
  { value: "all", label: "AP Stats as a whole" },
  { value: "1", label: "Unit 1" },
  { value: "2", label: "Unit 2" },
  { value: "3", label: "Unit 3" },
  { value: "4", label: "Unit 4" },
  { value: "5", label: "Unit 5" },
  { value: "6", label: "Unit 6" },
  { value: "7", label: "Unit 7" },
  { value: "8", label: "Unit 8" },
  { value: "9", label: "Unit 9" },
];

export default function StatsMiniSectionPage() {
  const [scope, setScope] = useState("all");
  const [section, setSection] = useState<MiniSection | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, "A" | "B" | "C" | "D" | null>>({});
  const [frqAnswers, setFrqAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1440);

  useEffect(() => {
    if (!section || submitted) return;
    if (timeLeft <= 0) {
      setSubmitted(true);
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
    setTimeLeft(1440);

    try {
      const r = await fetch("/api/mini-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, subject: "stats" }),
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

  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "36px 18px 60px", fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/stats" style={{ color: "#fff", textDecoration: "none", fontWeight: 800 }}>← Back</Link>

        <div style={{ marginTop: 24, border: "1px solid rgba(255,255,255,0.16)", borderRadius: 24, padding: 24, background: "rgba(255,255,255,0.04)" }}>
          <h1 style={{ fontSize: 42, margin: 0, fontWeight: 900 }}>AP Stats Timed Mini Section</h1>
          <p style={{ color: "#ccc" }}>13 MCQs + 2 FRQs • 24 minutes</p>

          <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 18 }}>Timer: {formatTime(timeLeft)}</div>

          <select value={scope} onChange={(e) => setScope(e.target.value)} style={{ background: "#111", color: "#fff", border: "1px solid #444", padding: "10px 12px", borderRadius: 12, fontWeight: 700, marginRight: 12 }}>
            {SCOPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>

          <button onClick={generateSection} disabled={loading} style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid #fff", background: "#fff", color: "#000", fontWeight: 900 }}>
            {loading ? "Generating..." : "Start Section"}
          </button>

          {submitted && section && (
            <div style={{ marginTop: 18, fontSize: 22, fontWeight: 900 }}>
              MCQ Score: {mcqScore}/13
            </div>
          )}
        </div>

        {err && <div style={{ marginTop: 20, color: "#ffb4b4" }}>{err}</div>}

        {section?.mcqs.map((q, index) => {
          const selected = mcqAnswers[index];
          return (
            <div key={index} style={{ marginTop: 22, border: "1px solid rgba(255,255,255,0.14)", borderRadius: 18, padding: 20, background: "rgba(255,255,255,0.04)" }}>
              <div style={{ fontWeight: 900, fontSize: 20 }}>MCQ {index + 1}</div>
              <p style={{ lineHeight: 1.6 }}>{q.prompt}</p>

              {(["A", "B", "C", "D"] as const).map((letter) => {
                const isSelected = selected === letter;
                const showCorrect = submitted && q.answer === letter;
                const showWrong = submitted && isSelected && q.answer !== letter;

                return (
                  <button
                    key={letter}
                    onClick={() => !submitted && setMcqAnswers((p) => ({ ...p, [index]: letter }))}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      marginTop: 10,
                      padding: 14,
                      borderRadius: 12,
                      background: isSelected ? "#fff" : "#111",
                      color: isSelected ? "#000" : "#fff",
                      border: showCorrect ? "2px solid rgba(0,255,0,0.65)" : showWrong ? "2px solid rgba(255,0,0,0.65)" : "1px solid rgba(255,255,255,0.14)",
                    }}
                  >
                    <strong>{letter}.</strong> {q.choices[letter]}
                  </button>
                );
              })}

              {submitted && <p style={{ color: "#ccc" }}>Correct: {q.answer}. {q.explanation}</p>}
            </div>
          );
        })}

        {section?.frqs.map((frq, index) => (
          <div key={index} style={{ marginTop: 22, border: "1px solid rgba(255,255,255,0.14)", borderRadius: 18, padding: 20, background: "rgba(255,255,255,0.04)" }}>
            <div style={{ fontWeight: 900, fontSize: 20 }}>FRQ {index + 1}</div>
            <p style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{frq.prompt}</p>
            <textarea
              disabled={submitted}
              value={frqAnswers[index] || ""}
              onChange={(e) => setFrqAnswers((p) => ({ ...p, [index]: e.target.value }))}
              rows={8}
              style={{ width: "100%", padding: 14, borderRadius: 12, background: "#111", color: "#fff", border: "1px solid #333" }}
            />
          </div>
        ))}

        {section && !submitted && (
          <button onClick={() => setSubmitted(true)} style={{ marginTop: 24, padding: "12px 18px", borderRadius: 12, border: "1px solid #fff", background: "#fff", color: "#000", fontWeight: 900 }}>
            Submit Section
          </button>
        )}
      </div>
    </main>
  );
}