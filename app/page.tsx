"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const JUDGES = ["Judge 1", "Judge 2", "Judge 3"] as const;

export default function LoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  function handleLogin() {
    if (!selected) return;
    sessionStorage.setItem("judge", selected);
    router.push("/score");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-10 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Pitch Competition</h1>
        <p className="text-gray-400 mt-2 text-lg">Select your judge profile to begin scoring</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {JUDGES.map((judge) => (
          <button
            key={judge}
            onClick={() => setSelected(judge)}
            className={`py-4 rounded-2xl text-xl font-semibold border-2 transition-all ${
              selected === judge
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500"
            }`}
          >
            {judge}
          </button>
        ))}
      </div>

      <button
        onClick={handleLogin}
        disabled={!selected}
        className="px-10 py-3 rounded-xl bg-indigo-600 text-white font-bold text-lg disabled:opacity-30 hover:bg-indigo-500 transition-colors"
      >
        Enter as {selected ?? "…"}
      </button>
    </main>
  );
}
