import Link from "next/link";

export default function ApesPage() {
  return (
    <main
      style={{
        padding: "48px 24px",
        fontFamily: "system-ui",
        backgroundColor: "#000000",
        color: "#ffffff",
        minHeight: "100vh",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 22,
          textDecoration: "none",
          color: "#fff",
          fontWeight: 800,
        }}
      >
        ← Back
      </Link>

      <h1 style={{ fontSize: 46, fontWeight: 900 }}>
        AP Environmental Science
      </h1>

      <p style={{ color: "#ccc", marginBottom: 24 }}>
        Practice APES with MCQs, FRQs, and timed sections.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <ToolCard
          title="Practice MCQs"
          desc="Generate APES multiple-choice questions."
          href="/apes/practice"
        />

        <ToolCard
          title="FRQ Studio"
          desc="Generate and grade APES FRQs."
          href="/apes/frq"
        />

        <ToolCard
          title="Timed Mini Section"
          desc="Full APES timed practice."
          href="/apes/mini-section"
        />
      </div>
    </main>
  );
}

function ToolCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        border: "2px solid white",
        borderRadius: 16,
        padding: 18,
        textDecoration: "none",
        color: "white",
      }}
    >
      <div style={{ fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 6, color: "#ccc" }}>{desc}</div>
    </Link>
  );
}