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
  rewrite_suggestion?: string;
};

export default function MicroFrqPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingGrade, setLoadingGrade] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FrqResult | null>(null);

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
        body: JSON.stringify({
          subject: "micro",
        }),
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
        setError(data?.error || "Failed to grade FRQ");
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

        <h1 style={{ fontSize: 42, marginBottom: 8, fontWeight: 900 }}>
          AP Micro FRQ Studio
        </h1>

        <p style={{ color: "#d6d6d6", marginBottom: 24, lineHeight: 1.5 }}>
          Generate AP Micro free-response prompts and get AI grading with feedback.
        </p>

        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <button
            onClick={generatePrompt}
            disabled={loadingPrompt}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #fff",
              background: "#fff",
              color: "#000",
              fontWeight: 800,
              cursor: loadingPrompt ? "not-allowed" : "pointer",
            }}
          >
            {loadingPrompt ? "Generating..." : "Generate FRQ Prompt"}
          </button>

          <button
            onClick={gradeResponse}
            disabled={!prompt || !response.trim() || loadingGrade}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #fff",
              background: !prompt || !response.trim() ? "#333" : "#fff",
              color: !prompt || !response.trim() ? "#bbb" : "#000",
              fontWeight: 800,
              cursor: !prompt || !response.trim() || loadingGrade ? "not-allowed" : "pointer",
            }}
          >
            {loadingGrade ? "Grading..." : "Grade Response"}
          </button>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: 14,
              borderRadius: 12,
              border: "1px solid rgba(255,80,80,0.5)",
              background: "rgba(255,80,80,0.12)",
              color: "#ffd4d4",
            }}
          >
            {error}
          </div>
        )}

        {prompt && (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 18,
              padding: 20,
              background: "rgba(255,255,255,0.04)",
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
              Prompt
            </div>
            <div style={{ lineHeight: 1.6, fontSize: 18 }}>{prompt}</div>
          </div>
        )}

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={10}
          placeholder="Write your AP Micro FRQ response here..."
          style={{
            width: "100%",
            padding: 16,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "#111",
            color: "#fff",
            fontSize: 16,
            lineHeight: 1.5,
            resize: "vertical",
          }}
        />

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

            {result.what_was_done_well?.length ? (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>What you did well</div>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
                  {result.what_was_done_well.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.what_to_improve?.length ? (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>What to improve</div>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
                  {result.what_to_improve.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.rewrite_suggestion ? (
              <div>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Rewrite suggestion</div>
                <div style={{ lineHeight: 1.6 }}>{result.rewrite_suggestion}</div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}