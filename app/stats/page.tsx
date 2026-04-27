import Link from "next/link";

export default function StatsPage() {
  return (
    <main style={{ padding: "48px 24px", fontFamily: "system-ui", backgroundColor: "#000", color: "#fff", minHeight: "100vh", maxWidth: 1100, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-flex", gap: 8, marginBottom: 22, textDecoration: "none", color: "#fff", fontWeight: 800 }}>← Back</Link>

      <header style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 14, color: "#cfcfcf", fontWeight: 700 }}>Levi AP Tutor Hub</div>
        <h1 style={{ fontSize: 46, margin: "10px 0", fontWeight: 900 }}>AP Statistics</h1>
        <p style={{ color: "#e5e5e5", maxWidth: 780, lineHeight: 1.55, fontSize: 18 }}>
          Practice AP Statistics with AI-generated MCQs, FRQs, and timed mini sections.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <ToolCard title="Practice MCQs" desc="Generate 5 AP Statistics MCQs by unit." href="/stats/practice" />
        <ToolCard title="FRQ Studio" desc="Generate and grade AP Statistics FRQs." href="/stats/frq" />
        <ToolCard title="Timed Mini Section" desc="Take a timed AP Stats drill with 13 MCQs and 2 FRQs." href="/stats/mini-section" />
      </div>
    </main>
  );
}

function ToolCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "#fff", border: "2px solid #fff", borderRadius: 18, padding: 18, display: "block", background: "#000" }}>
      <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: 999, border: "1px solid #fff", fontSize: 12, marginBottom: 10, color: "#e5e5e5" }}>Live Now</div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 8, color: "#e5e5e5", lineHeight: 1.5 }}>{desc}</div>
      <div style={{ marginTop: 14, fontWeight: 800 }}>Open</div>
    </Link>
  );
}