"use client";

import Link from "next/link";
import { useState } from "react";

type FrqResult = {
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
};

export default function FrqPage() {
  const [prompt, setPrompt] = useState("");
  const [studentResponse, setStudentResponse] = useState("");
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingGrade, setLoadingGrade] = useState(false);
  const [result, setResult] = useState<FrqResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generatePrompt() {
    setLoadingPrompt(true);
    setError(null);
    setResult(null);
    setStudentResponse("");

    try {
      const r = await fetch("/api/frq-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "gov" }),
      });

      const data = await r.json();

      if (!r.ok) {
        throw new Error(data?.error || "Failed to generate FRQ");
      }

      setPrompt(data.prompt || "");
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoadingPrompt(false);
    }
  }

  async function grade() {
    setLoadingGrade(true);
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

      const data = await r.json();

      if (!r.ok) {
        throw new Error(data?.error || "Failed to grade FRQ");
      }

      setResult(data);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoadingGrade(false);
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
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      <Link href="/gov" style={{ textDecoration: "none", color: "#ffffff" }}>
        ← Back
      </Link>

      <h1 style={{ fontSize: 36, marginTop: 20 }}>FRQ Studio</h1>
      <p style={{ color: "#e5e5e5" }}>
        Generate a prompt, write your response, and get rubric-style scoring.
      </p>

      <button
        onClick={generatePrompt}
        style={{
          marginTop: 12,
          marginBottom: 20,
          padding: "12px 16px",
          borderRadius: 12,
          border: "2px solid #ffffff",
          background: loadingPrompt ? "#222222" : "#ffffff",
          color: loadingPrompt ? "#ffffff" : "#000000",
          fontWeight: 800,
          cursor: loadingPrompt ? "not-allowed" : "pointer",
        }}
      >
        {loadingPrompt ? "Generating..." : "Generate Prompt"}
      </button>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 18,
          padding: 18,
          background: "#111",
          marginBottom: 18,
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 10, fontSize: 18 }}>Prompt</div>
        <div
          style={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
            color: "#f1f1f1",
            fontSize: 18,
          }}
        >
          {prompt || "Click “Generate Prompt” to load an AP Gov FRQ."}
        </div>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 18,
          padding: 18,
          background: "#111",
          marginBottom: 18,
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 10, fontSize: 18 }}>Your Response</div>
        <textarea
          value={studentResponse}
          onChange={(e) => setStudentResponse(e.target.value)}
          rows={10}
          placeholder="Write your FRQ response here..."
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "1px solid #333",
            background: "#0b0b0b",
            color: "#fff",
            fontSize: 16,
            lineHeight: 1.6,
            resize: "vertical",
          }}
        />
      </div>

      <button
        onClick={grade}
        disabled={loadingGrade || !prompt.trim() || studentResponse.trim().length < 20}
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          border: "2px solid #ffffff",
          background:
            loadingGrade || !prompt.trim() || studentResponse.trim().length < 20
              ? "#222222"
              : "#ffffff",
          color:
            loadingGrade || !prompt.trim() || studentResponse.trim().length < 20
              ? "#ffffff"
              : "#000000",
          fontWeight: 800,
          cursor:
            loadingGrade || !prompt.trim() || studentResponse.trim().length < 20
              ? "not-allowed"
              : "pointer",
        }}
      >
        {loadingGrade ? "Grading..." : "Grade with AI"}
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
            marginTop: 18,
            padding: 16,
            borderRadius: 16,
            border: "2px solid #ffffff",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900 }}>
            Score: {result.overall_score_0_to_6}/6
          </div>

          {result.breakdown && (
            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
              }}
            >
              <ScoreCard title="Thesis / Claim" value={`${result.breakdown.thesis_claim_0_to_1 ?? 0}/1`} />
              <ScoreCard title="Evidence" value={`${result.breakdown.evidence_0_to_2 ?? 0}/2`} />
              <ScoreCard title="Reasoning" value={`${result.breakdown.reasoning_0_to_2 ?? 0}/2`} />
              <ScoreCard title="Accuracy / Precision" value={`${result.breakdown.accuracy_precision_0_to_1 ?? 0}/1`} />
            </div>
          )}

          <Section title="What you did well" items={result.what_was_done_well} />
          <Section title="What to improve" items={result.what_to_improve} />
          <Section title="Missing or incorrect" items={result.missing_or_incorrect} />
        </div>
      )}
    </main>
  );
}

function ScoreCard({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 12,
        padding: 12,
        background: "#0b0b0b",
      }}
    >
      <div style={{ fontSize: 13, color: "#cfcfcf", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function Section({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 22, color: "#e5e5e5", lineHeight: 1.6 }}>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}