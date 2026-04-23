"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Mcq = {
  unit: string;
  prompt: string;
  choices: { A: string; B: string; C: string; D: string };
  answer: "A" | "B" | "C" | "D";
  explanation: string;
};

const APES_UNITS = [
  { value: "1", label: "Unit 1 — The Living World: Ecosystems" },
  { value: "2", label: "Unit 2 — Biodiversity" },
  { value: "3", label: "Unit 3 — Populations" },
  { value: "4", label: "Unit 4 — Earth Systems" },
  { value: "5", label: "Unit 5 — Land and Water Use" },
  { value: "6", label: "Unit 6 — Energy Resources" },
  { value: "7", label: "Unit 7 — Atmospheric Pollution" },
  { value: "8", label: "Unit 8 — Aquatic Pollution" },
  { value: "9", label: "Unit 9 — Global Change" },
  { value: "any", label: "Any Unit" },
];

export default function ApesPractice() {
  const [unit, setUnit] = useState("any");
  const [questions, setQuestions] = useState<Mcq[]>([]);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  const score = useMemo(() => {
    if (!checked) return 0;
    return questions.reduce(
      (sum, q, i) => sum + (selected[i] === q.answer ? 1 : 0),
      0
    );
  }, [checked, questions, selected]);

  async function generate() {
    const res = await fetch("/api/mcq", {
      method: "POST",
      body: JSON.stringify({ subject: "apes", unit, count: 5 }),
    });

    const data = await res.json();
    setQuestions(data.questions || []);
    setSelected({});
    setChecked(false);
  }

  function choose(i: number, ans: string) {
    if (checked) return;
    setSelected({ ...selected, [i]: ans });
  }

  return (
    <main style={{ padding: 40, color: "white" }}>
      <Link href="/apes">← Back</Link>

      <h1>APES Practice</h1>

      <select value={unit} onChange={(e) => setUnit(e.target.value)}>
        {APES_UNITS.map((u) => (
          <option key={u.value} value={u.value}>
            {u.label}
          </option>
        ))}
      </select>

      <button onClick={generate}>Generate Questions</button>

      {questions.map((q, i) => (
        <div key={i}>
          <p>{q.prompt}</p>
          {(["A", "B", "C", "D"] as const).map((c) => (
            <div key={c} onClick={() => choose(i, c)}>
              {c}. {q.choices[c]}
            </div>
          ))}
        </div>
      ))}

      {questions.length > 0 && !checked && (
        <button onClick={() => setChecked(true)}>Submit</button>
      )}

      {checked && <div>Score: {score}/{questions.length}</div>}
    </main>
  );
}