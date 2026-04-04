"use client";

import Link from "next/link";
import { useState } from "react";

export default function FrqPage() {
  const [prompt, setPrompt] = useState(
    "Develop an argument that explains whether the power of the presidency has increased over time. Use at least one piece of evidence (e.g., an institution, policy action, or Supreme Court case)."
  );
  const [studentResponse, setStudentResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function grade() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const r = await fetch("/api/frq-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          response: studentResponse,
        }),
      });

      if (!r.ok) {
        const text = await r.text();
        throw new Error(text);
      }

      const data = await r.json();
      setResult(data);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "system-ui",
        backgroundColor: "#000000",
        color: "#ffffff",
        minHeight: "100vh",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <Link href="/" style={{ textDecoration: "none", color: "#ffffff" }}>
        ← Home
      </Link>

      <h1 style={{ fontSize: 36, marginTop: 20 }}>FRQ Studio</h1>
      <p style={{ color: "#e5e5e5" }}>
        Paste a prompt + your answer. Click <b>Grade with AI</b> for rubric-based
        feedback.
      </p>

      <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
        <label style={{ fontWeight: 700 }}>FRQ Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "2px solid #ffffff",
            background: "#000000",
            color: "#ffffff",
            fontSize: 16,
          }}
        />

        <label style={{ fontWeight: 700, marginTop: 6 }}>Your Response</label>
        <textarea
          value={studentResponse}
          onChange={(e) => setStudentResponse(e.target.value)}
          rows={10}
          placeholder="Write your FRQ response here..."
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "2px solid #ffffff",
            background: "#000000",
            color: "#ffffff",
            fontSize: 16,
          }}
        />

        <button
          onClick={grade}
          disabled={loading || studentResponse.trim().length < 20}
          style={{
            marginTop: 8,
            padding: "12px 16px",
            borderRadius: 12,
            border: "2px solid #ffffff",
            background: loading ? "#222222" : "#ffffff",
            color: loading ? "#ffffff" : "#000000",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Grading..." : "Grade with AI"}
        </button>

        {error && (
          <div
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 12,
              border: "2px solid #ef4444",
              color: "#fecaca",
              whiteSpace: "pre-wrap",
            }}
          >
            <b>Error:</b> {error}
          </div>
        )}

        {result && (
          <div
            style={{
              marginTop: 10,
              padding: 16,
              borderRadius: 16,
              border: "2px solid #ffffff",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900 }}>
              Overall Score: {result.overall_score_0_to_6}/6
            </div>

            {result.breakdown && (
              <div style={{ marginTop: 10, color: "#e5e5e5" }}>
                <div>Thesis/Claim: {result.breakdown.thesis_claim_0_to_1}/1</div>
                <div>Evidence: {result.breakdown.evidence_0_to_2}/2</div>
                <div>Reasoning: {result.breakdown.reasoning_0_to_2}/2</div>
                <div>
                  Accuracy/Precision: {result.breakdown.accuracy_precision_0_to_1}/1
                </div>
              </div>
            )}

            <Section title="What you did well" items={result.what_was_done_well} />
            <Section title="What to improve" items={result.what_to_improve} />
            <Section title="Missing / incorrect" items={result.missing_or_incorrect} />

            {result.rewrite_suggestion && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 900 }}>Rewrite suggestion</div>
                <div style={{ color: "#e5e5e5", whiteSpace: "pre-wrap" }}>
                  {result.rewrite_suggestion}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Section({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontWeight: 900 }}>{title}</div>
      <ul style={{ marginTop: 6, color: "#e5e5e5" }}>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
