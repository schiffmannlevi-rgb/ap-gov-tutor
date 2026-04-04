export type Choice = { id: "A" | "B" | "C" | "D"; text: string };

export type Mcq = {
  id: string;
  unit: 1 | 2 | 3 | 4 | 5;
  topic: string;
  skill: "concept" | "scenario" | "data" | "case";
  stem: string;
  choices: Choice[];
  answer: Choice["id"];
  explanation: string;
};

export const DIAGNOSTIC_QUESTIONS: Mcq[] = [
  {
    id: "u1-fed-001",
    unit: 1,
    topic: "federalism",
    skill: "concept",
    stem:
      "Which scenario best illustrates federalism in the U.S. system of government?",
    choices: [
      { id: "A", text: "Congress impeaches a federal judge for misconduct." },
      { id: "B", text: "A state sets high school graduation requirements while the federal government sets standards for airline safety." },
      { id: "C", text: "The Supreme Court overturns a state law as unconstitutional." },
      { id: "D", text: "The President issues an executive order directing a federal agency to change a policy." },
    ],
    answer: "B",
    explanation:
      "Federalism divides authority between national and state governments; the example shows each level making policy in its own area.",
  },
];
