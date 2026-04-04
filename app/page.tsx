import Link from "next/link";

export default function HomePage() {
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
      <header style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: "#cfcfcf" }}>Levi’s AP Gov Tutor</div>
        <h1 style={{ fontSize: 44, margin: "10px 0 8px" }}>
          AP Gov Study Hub
        </h1>
        <p style={{ color: "#e5e5e5", maxWidth: 760, lineHeight: 1.5 }}>
          Practice FRQs, generate AP-style multiple choice, and run timed study
          drills across individual units or all of AP Government.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 18,
        }}
      >
        <Card
          title="FRQ Studio"
          desc="Paste a prompt + your answer. Get rubric-based AI scoring and feedback."
          href="/frq"
          pill="Grading"
        />
        <Card
          title="Practice (MCQ)"
          desc="Generate AP-style multiple-choice question sets by unit."
          href="/practice"
          pill="Questions"
        />
        <Card
          title="Timed Mini Section"
          desc="Take a 6-minute sprint with 13 MCQs and 2 FRQs for one unit or all AP Gov."
          href="/mini-section"
          pill="Timed"
        />
      </div>
    </main>
  );
}

function Card({
  title,
  desc,
  href,
  pill,
}: {
  title: string;
  desc: string;
  href: string;
  pill: string;
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
        {pill}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 8, color: "#e5e5e5", lineHeight: 1.5 }}>
        {desc}
      </div>
      <div style={{ marginTop: 14, fontWeight: 800 }}>Open →</div>
    </Link>
  );
}