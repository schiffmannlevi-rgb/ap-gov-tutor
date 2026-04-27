import Link from "next/link";

export default function StatsFrqPage() {
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
        <Link href="/stats" style={{ color: "#fff", fontWeight: 800 }}>
          ← Back
        </Link>

        <h1 style={{ fontSize: 42, marginTop: 20 }}>
          AP Stats FRQ Studio
        </h1>

        <p style={{ color: "#ccc" }}>
          AP Stats FRQ practice coming soon.
        </p>
      </div>
    </main>
  );
}