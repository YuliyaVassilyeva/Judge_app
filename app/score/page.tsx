"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CRITERIA = [
  { key: "market_opportunity", label: "Market Opportunity" },
  { key: "founding_team", label: "Founding Team" },
  { key: "traction", label: "Traction" },
  { key: "business_model", label: "Business Model" },
  { key: "moat", label: "Moat" },
  { key: "presentation_skills", label: "Presentation Skills" },
] as const;

type Scores = Record<(typeof CRITERIA)[number]["key"], number>;

const STARTUPS = ["A", "B", "C", "D", "E"] as const;

const defaultScores = (): Scores =>
  Object.fromEntries(CRITERIA.map((c) => [c.key, 5])) as Scores;

export default function ScorePage() {
  const router = useRouter();
  const [judge, setJudge] = useState<string>("");
  const [startupName, setStartupName] = useState("");
  const [scores, setScores] = useState<Scores>(defaultScores());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("judge");
    if (!stored) router.push("/");
    else setJudge(stored);
  }, [router]);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startupName.trim()) return;
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from("scores").insert({
      judge,
      startup_name: startupName.trim(),
      ...scores,
      total_score: total,
    });

    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setStartupName("");
        setScores(defaultScores());
      }, 2000);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Score a Startup</h1>
          <p className="text-indigo-400 font-medium mt-1">{judge}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { sessionStorage.removeItem("judge"); router.push("/"); }}
            className="text-sm text-gray-400 hover:text-white underline"
          >
            Log out
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Startup
          </label>
          <div className="flex gap-3">
            {STARTUPS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setStartupName(s); setScores(defaultScores()); setSubmitted(false); }}
                className={`flex-1 py-3 rounded-xl text-xl font-bold border-2 transition-all ${
                  startupName === s
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-indigo-500"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {CRITERIA.map((c) => (
            <div key={c.key} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-gray-200">{c.label}</label>
                <span className="text-indigo-400 font-bold text-xl w-8 text-right">
                  {scores[c.key]}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={scores[c.key]}
                onChange={(e) =>
                  setScores((prev) => ({ ...prev, [c.key]: Number(e.target.value) }))
                }
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>1</span><span>10</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between bg-gray-800 rounded-xl px-5 py-4">
          <span className="text-gray-400 font-medium">Total Score</span>
          <span className="text-2xl font-bold text-indigo-400">{total} / 60</span>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !startupName.trim()}
          className="py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 font-bold text-lg transition-colors"
        >
          {submitted ? "Submitted!" : submitting ? "Submitting…" : "Submit Score"}
        </button>
      </form>
    </main>
  );
}
