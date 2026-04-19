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

export default function MicroFrqPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [result, setResult] = useState<FrqResult | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingGrade, setLoadingGrade] = useState(false);
  const [error, setError] = useState("");

  async function generatePrompt() {
    setLoadingPrompt(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/frq-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject: "micro" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to generate FRQ");
        return;
      }

      setPrompt(data.prompt || "");
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoadingPrompt(false);
    }
  }

  async function gradeResponse() {
    if (!prompt || !response.trim()) return;

    setLoadingGrade(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/frq-grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          response,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to grade");
        return;
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
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: 40,
        fontFamily: "system-ui",
      }}
    >
      <div style={{ maxWidth: 950, margin: "0 auto" }}>
        <Link
          href="/micro"
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

        <h1 style={{ fontSize: 42, marginTop: 10, fontWeight: 900 }}>
          AP Micro FRQ Studio
        </h1>

        <p style={{ color: "#ccc", marginBottom: 20 }}>
          Generate a prompt, write your response, and get rubric-style scoring.
        </p>

        <button
          onClick={generatePrompt}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #fff",
            background: "#fff",
            color: "#000",
            fontWeight: 800,
            marginBottom: 20,
            cursor: loadingPrompt ? "not-allowed" : "pointer",
          }}
        >
          {loadingPrompt ? "Generating..." : "Generate Prompt"}
        </button>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 16,
            padding: 18,
            background: "#111",
            marginBottom: 18,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Prompt</div>
          <div style={{ lineHeight: 1.6, color: "#f1f1f1" }}>
            {prompt || "Click “Generate Prompt” to load an AP Micro FRQ."}
          </div>
        </div>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 16,
            padding: 18,
            background: "#111",
            marginBottom: 18,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Your Response</div>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your response here..."
            rows={10}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "1px solid #333",
              background: "#0b0b0b",
              color: "#fff",
              fontSize: 16,
              lineHeight: 1.5,
              resize: "vertical",
            }}
          />
        </div>

        <button
          onClick={gradeResponse}
          disabled={!prompt || !response}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #fff",
            background: !prompt || !response ? "#333" : "#fff",
            color: !prompt || !response ? "#999" : "#000",
            fontWeight: 800,
            cursor: !prompt || !response || loadingGrade ? "not-allowed" : "pointer",
          }}
        >
          {loadingGrade ? "Grading..." : "Grade Response"}
        </button>

        {error && (
          <div style={{ marginTop: 20, color: "#ffb4b4" }}>{error}</div>
        )}

        {result && (
          <div
            style={{
              marginTop: 22,
              padding: 18,
              borderRadius: 16,
              border: "1px solid #333",
              background: "#0a0a0a",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 12 }}>
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
                <ScoreCard
                  title="Thesis / Claim"
                  value={`${result.breakdown.thesis_claim_0_to_1 ?? 0}/1`}
                />
                <ScoreCard
                  title="Evidence"
                  value={`${result.breakdown.evidence_0_to_2 ?? 0}/2`}
                />
                <ScoreCard
                  title="Reasoning"
                  value={`${result.breakdown.reasoning_0_to_2 ?? 0}/2`}
                />
                <ScoreCard
                  title="Accuracy / Precision"
                  value={`${result.breakdown.accuracy_precision_0_to_1 ?? 0}/1`}
                />
              </div>
            )}

            <Section title="What you did well" items={result.what_was_done_well} />
            <Section title="What to improve" items={result.what_to_improve} />
            <Section title="Missing or incorrect" items={result.missing_or_incorrect} />
          </div>
        )}
      </div>
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