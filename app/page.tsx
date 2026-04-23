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
        maxWidth: 1150,
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 14, color: "#cfcfcf", fontWeight: 700 }}>
          Levi AP Tutor Hub
        </div>

        <h1 style={{ fontSize: 48, margin: "10px 0 10px", fontWeight: 900 }}>
          AP Study Hub
        </h1>

        <p
          style={{
            color: "#e5e5e5",
            maxWidth: 780,
            lineHeight: 1.55,
            fontSize: 18,
          }}
        >
          Practice multiple-choice questions, generate and grade FRQs, and run
          timed mini sections across your AP classes.
        </p>
      </header>

      <section style={{ marginTop: 20 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            marginBottom: 14,
          }}
        >
          Subjects
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <SubjectCard
            title="AP U.S. Government"
            desc="MCQ practice, FRQ grading, and timed mini sections."
            href="/gov"
            pill="Live Now"
            sublinks={[{ label: "Enter", href: "/gov" }]}
          />

          <SubjectCard
            title="AP Microeconomics"
            desc="Practice MCQs, FRQs, and timed sections."
            href="/micro"
            pill="Live Now"
            sublinks={[{ label: "Enter", href: "/micro" }]}
          />

          <SubjectCard
            title="AP Macroeconomics"
            desc="Practice MCQs, FRQs, and timed sections."
            href="/macro"
            pill="Live Now"
            sublinks={[{ label: "Enter", href: "/macro" }]}
          />

          <SubjectCard
            title="AP Environmental Science"
            desc="Practice MCQs and build toward full APES tools."
            href="/apes"
            pill="Live Now"
            sublinks={[{ label: "Enter", href: "/apes" }]}
          />

          <ComingSoonCard
            title="AP Statistics"
            desc="MCQs, FRQs, concept review, and timed practice sets."
          />
        </div>
      </section>
    </main>
  );
}

function SubjectCard({
  title,
  desc,
  href,
  pill,
  sublinks,
}: {
  title: string;
  desc: string;
  href: string;
  pill: string;
  sublinks: { label: string; href: string }[];
}) {
  return (
    <div
      style={{
        border: "2px solid #ffffff",
        borderRadius: 18,
        padding: 18,
        background: "#000000",
      }}
    >
      <Link
        href={href}
        style={{
          textDecoration: "none",
          color: "#ffffff",
          display: "block",
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

        <div style={{ fontSize: 24, fontWeight: 900 }}>{title}</div>
        <div style={{ marginTop: 8, color: "#e5e5e5", lineHeight: 1.5 }}>
          {desc}
        </div>
      </Link>

      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {sublinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            style={{
              textDecoration: "none",
              color: "#ffffff",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.04)",
              fontWeight: 700,
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
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

      <div style={{ fontSize: 24, fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 8, color: "#e5e5e5", lineHeight: 1.5 }}>
        {desc}
      </div>
    </div>
  );
}