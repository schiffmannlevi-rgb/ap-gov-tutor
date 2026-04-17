import Link from "next/link";

export default function MicroPage() {
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
          AP Microeconomics
        </h1>

        <p
          style={{
            color: "#e5e5e5",
            maxWidth: 780,
            lineHeight: 1.55,
            fontSize: 18,
          }}
        >
          Practice AP Micro with AI-generated multiple-choice questions and
          subject-specific study tools.
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
          desc="Generate AP-style Micro multiple-choice questions."
          href="/micro/practice"
          live
        />

        <ComingSoonCard
          title="FRQ Studio"
          desc="Generate and grade AP Micro free-response questions."
        />

        <ComingSoonCard
          title="Timed Mini Section"
          desc="Take a timed AP Micro drill with MCQs and FRQs."
        />
      </div>
    </main>
  );
}

function ToolCard({
  title,
  desc,
  href,
  live,
}: {
  title: string;
  desc: string;
  href: string;
  live?: boolean;
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
      {live ? (
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
      ) : null}
      <div style={{ fontSize: 22, fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 8, color: "#e5e5e5", lineHeight: 1.5 }}>
        {desc}
      </div>
      <div style={{ marginTop: 14, fontWeight: 800 }}>Open →</div>
    </Link>
  );
}

function ComingSoonCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        border: "2px solid rgba(255,255,255,0.45)",
        borderRadius: 18,
        padding: 18,
        background: "#000000",
        opacity: 0.92,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "4px 10px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.5)",
          fontSize: 12,
          marginBottom: 10,
          color: "#d9d9d9",
        }}
      >
        Coming Soon
      </div>

      <div style={{ fontSize: 22, fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 8, color: "#e5e5e5", lineHeight: 1.5 }}>
        {desc}
      </div>
    </div>
  );
}