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

export default function MacroFrqPage() {
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
    setResponse("");

    try {
      const res = await fetch("/api/frq-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject: "macro" }),
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
    if (!prompt.trim() || !response.trim()) return;

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
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Link
          href="/macro"
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
          ← Back
        </Link>

        <h1 style={{ fontSize: 42, fontWeight: 900 }}>
          AP Macro FRQ Studio
        </h1>

        <p style={{ color: "#ccc", marginBottom: 20 }}>
          Generate a prompt, write your response, and get rubric-based grading.
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
          }}
        >
          {loadingPrompt ? "Generating..." : "Generate Prompt"}
        </button>

        {/* PROMPT */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 18,
            padding: 18,
            background: "#111",
            marginBottom: 18,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 10, fontSize: 18 }}>
            Prompt
          </div>

          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              fontSize: 18,
            }}
          >
            {prompt || "Click Generate Prompt"}
          </div>
        </div>

        {/* RESPONSE */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 18,
            padding: 18,
            background: "#111",
            marginBottom: 18,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Your Response
          </div>

          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={10}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "1px solid #333",
              background: "#0b0b0b",
              color: "#fff",
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
          }}
        >
          {loadingGrade ? "Grading..." : "Grade Response"}
        </button>

        {error && (
          <div style={{ marginTop: 20, color: "#ff6b6b" }}>{error}</div>
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
            <div style={{ fontWeight: 900, fontSize: 22 }}>
              Score: {result.overall_score_0_to_6}/6
            </div>

            <ul style={{ marginTop: 10 }}>
              {result.what_to_improve?.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}