import Link from "next/link";

export default function BioMiniSectionPage() {
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

        <h1 style={{ fontSize: 42, marginTop: 20 }}>AP Bio Timed Mini Section</h1>

        <p style={{ color: "#ccc" }}>
          Timed AP Bio practice section coming soon.
        </p>
      </div>
    </main>
  );
}