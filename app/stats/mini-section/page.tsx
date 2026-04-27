"use client";

import Link from "next/link";
import { useState } from "react";

export default function StatsMiniSectionPage() {
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(24 * 60);

  function formatTime(t: number) {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
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
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/stats" style={{ color: "#fff", fontWeight: 800 }}>
          ← Back
        </Link>

        <h1 style={{ fontSize: 42, marginTop: 20 }}>
          AP Stats Timed Mini Section
        </h1>

        {!started ? (
          <>
            <p style={{ color: "#ccc", marginTop: 10 }}>
              13 MCQs + 2 FRQs • 24 minutes
            </p>

            <button
              onClick={() => setStarted(true)}
              style={{
                marginTop: 20,
                padding: "12px 18px",
                borderRadius: 10,
                border: "1px solid #fff",
                background: "#fff",
                color: "#000",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Start Section
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                marginTop: 20,
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              Time: {formatTime(time)}
            </div>

            <div style={{ marginTop: 30 }}>
              <p style={{ color: "#ccc" }}>
                Mini section generation will plug into your API next.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}