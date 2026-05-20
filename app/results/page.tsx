"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CRITERIA = [
  { key: "market_opportunity", label: "Market Opp." },
  { key: "founding_team", label: "Team" },
  { key: "traction", label: "Traction" },
  { key: "business_model", label: "Biz Model" },
  { key: "moat", label: "Moat" },
  { key: "presentation_skills", label: "Presentation" },
];

type Score = {
  id: string;
  judge: string;
  startup_name: string;
  market_opportunity: number;
  founding_team: number;
  traction: number;
  business_model: number;
  moat: number;
  presentation_skills: number;
  total_score: number;
  created_at: string;
};

type StartupSummary = {
  startup_name: string;
  scores: Score[];
  avg_total: number;
};

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<StartupSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: rows } = await supabase
        .from("scores")
        .select("*")
        .order("startup_name");

      if (!rows) return;

      const grouped: Record<string, Score[]> = {};
      for (const row of rows) {
        if (!grouped[row.startup_name]) grouped[row.startup_name] = [];
        grouped[row.startup_name].push(row);
      }

      const summaries = Object.entries(grouped).map(([name, scores]) => ({
        startup_name: name,
        scores,
        avg_total: Math.round(scores.reduce((a, s) => a + s.total_score, 0) / scores.length),
      }));

      summaries.sort((a, b) => b.avg_total - a.avg_total);
      setData(summaries);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Results</h1>
        <button
          onClick={() => router.push("/score")}
          className="text-sm text-gray-400 hover:text-white underline"
        >
          Back to scoring
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}

      {!loading && data.length === 0 && (
        <p className="text-gray-500">No scores submitted yet.</p>
      )}

      <div className="flex flex-col gap-6">
        {data.map((startup, idx) => (
          <div key={startup.startup_name} className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-indigo-400">#{idx + 1}</span>
              <div>
                <h2 className="text-xl font-bold">{startup.startup_name}</h2>
                <p className="text-gray-400 text-sm">
                  {startup.scores.length} judge{startup.scores.length !== 1 ? "s" : ""} · Avg total:{" "}
                  <span className="text-indigo-400 font-semibold">{startup.avg_total}/60</span>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase">
                    <th className="text-left pb-2 pr-4">Judge</th>
                    {CRITERIA.map((c) => (
                      <th key={c.key} className="text-center pb-2 px-2">{c.label}</th>
                    ))}
                    <th className="text-center pb-2 pl-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {startup.scores.map((s) => (
                    <tr key={s.id} className="border-t border-gray-700">
                      <td className="py-2 pr-4 font-medium text-gray-300">{s.judge}</td>
                      {CRITERIA.map((c) => (
                        <td key={c.key} className="text-center py-2 px-2 text-gray-300">
                          {s[c.key as keyof Score]}
                        </td>
                      ))}
                      <td className="text-center py-2 pl-2 font-bold text-indigo-400">
                        {s.total_score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
