"use client";

import { useState } from "react";
import Link from "next/link";

export default function BioFrqPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function generatePrompt() {
    setLoading(true);
    setError("");
    setPrompt("");
    setFeedback("");

    try {
      const res = await fetch("/api/frq-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "bio" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate prompt");
        return;
      }

      setPrompt(data.prompt);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function gradeResponse() {
    if (!response) return;

    setGrading(true);
    setError("");
    setFeedback("");

    try {
      const res = await fetch("/api/frq-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "bio",
          prompt,
          response,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to grade response");
        return;
      }

      setFeedback(data.feedback || "No feedback returned.");
    } catch (e: any) {
      setError(String(e));
    } finally {
      setGrading(false);
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
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link href="/bio" style={{ color: "#fff", fontWeight: 800 }}>
          ← Back
        </Link>

        <h1 style={{ fontSize: 42, marginTop: 10 }}>AP Bio FRQ Studio</h1>
        <p style={{ color: "#ccc", marginBottom: 20 }}>
          Generate a prompt, write your response, and get rubric-style feedback.
        </p>

        <button
          onClick={generatePrompt}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #fff",
            background: "#fff",
            color: "#000",
            fontWeight: 800,
            marginBottom: 20,
            cursor: "pointer",
          }}
        >
          {loading ? "Generating..." : "Generate Prompt"}
        </button>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              border: "1px solid red",
              borderRadius: 10,
              color: "#ffb3b3",
            }}
          >
            {error}
          </div>
        )}

        {prompt && (
          <div
            style={{
              border: "1px solid #333",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <strong>Prompt</strong>
            <p style={{ marginTop: 10, lineHeight: 1.6 }}>{prompt}</p>
          </div>
        )}

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write your response here..."
          style={{
            width: "100%",
            minHeight: 180,
            padding: 14,
            borderRadius: 10,
            background: "#111",
            color: "#fff",
            border: "1px solid #444",
            marginBottom: 16,
          }}
        />

        <button
          onClick={gradeResponse}
          disabled={grading}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #fff",
            background: "#fff",
            color: "#000",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {grading ? "Grading..." : "Grade Response"}
        </button>

        {feedback && (
          <div
            style={{
              marginTop: 20,
              border: "1px solid #333",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <strong>Feedback</strong>
            <p style={{ marginTop: 10, lineHeight: 1.6 }}>{feedback}</p>
          </div>
        )}
      </div>
    </main>
  );
}