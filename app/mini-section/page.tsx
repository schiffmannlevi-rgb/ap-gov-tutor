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
  what_to_improve?: string[];
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

  const [timeLeft, setTimeLeft] = useState(1440); // 24 minutes
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
    setTimeLeft(1440); // reset timer

    try {
      const r = await fetch("/api/mini-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
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
        padding: "40px 18px",
        fontFamily: "system-ui",
      }}
    >
      <Link href="/" style={{ color: "#fff", fontWeight: 800 }}>
        ← Back
      </Link>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 42, fontWeight: 900 }}>
          Timed Mini Section
        </h1>

        <p style={{ opacity: 0.85 }}>
          13 MCQs + 2 FRQs in 24 minutes.
        </p>

        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            {SCOPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button onClick={generateSection}>
            {loading ? "Generating..." : "Start Section"}
          </button>

          {section && (
            <div style={{ marginLeft: "auto", fontSize: 24 }}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {section && (
          <div style={{ marginTop: 20 }}>
            <div>MCQ Score: {submitted ? `${mcqScore}/13` : "-"}</div>
          </div>
        )}
      </div>
    </main>
  );
}