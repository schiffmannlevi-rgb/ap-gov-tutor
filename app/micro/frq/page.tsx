import Link from "next/link";

export default function MicroFrqPage() {
  return (
    <main style={{ padding: 40, background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "system-ui" }}>
      <Link href="/micro" style={{ color: "#fff", fontWeight: 800, textDecoration: "none" }}>
        ← Back
      </Link>
      <h1>AP Micro FRQ Studio</h1>
      <p>This page is next.</p>
    </main>
  );
}