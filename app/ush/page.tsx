import Link from "next/link";

export default function UshPage() {
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
          opacity: 0.9,
        }}
      >
        <span style={{ fontSize: 20 }}>←</span>
        <span>Back</span>
      </Link>

      <header style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 14, color: "#cfcfcf", fontWeight: 700 }}>
          Levi AP Tutor Hub
        </div>

        <h1 style={{ fontSize: 46, margin: "10px 0 10px", fontWeight: 900 }}>
          AP U.S. History
        </h1>

        <p
          style={{
            color: "#e5e5e5",
            maxWidth: 780,
            lineHeight: 1.55,
            fontSize: 18,
          }}
        >
          Practice APUSH with AI-generated multiple-choice questions,
          historical writing prompts, and timed mini sections.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <ToolCard
          title="Practice MCQs"
          desc="Generate 5 APUSH multiple-choice questions by period."
          href="/ush/practice"
        />

        <ToolCard
          title="Writing Studio"
          desc="Generate and grade APUSH SAQ, LEQ, and DBQ-style prompts."
          href="/ush/frq"
        />

        <ToolCard
          title="Timed Mini Section"
          desc="Take a timed APUSH drill with 13 MCQs and 2 writing prompts."
          href="/ush/mini-section"
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
        textDecoration: "none",
        color: "#ffffff",
        border: "2px solid #ffffff",
        borderRadius: 18,
        padding: 18,
        display: "block",
        background: "#000000",
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "4px 10px",
          borderRadius: 999,
          border: "1px solid #ffffff",
          fontSize: 12,
          marginBottom: 10,
          color: "#e5e5e5",
        }}
      >
        Live Now
      </div>

      <div style={{ fontSize: 22, fontWeight: 900 }}>{title}</div>

      <div style={{ marginTop: 8, color: "#e5e5e5", lineHeight: 1.5 }}>
        {desc}
      </div>

      <div style={{ marginTop: 14, fontWeight: 800 }}>Open</div>
    </Link>
  );
}