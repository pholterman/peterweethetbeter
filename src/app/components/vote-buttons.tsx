"use client";

import { useActionState, useEffect, useState } from "react";
import { castVote } from "@/app/actions/vote";

type Props = {
  categoryId: number;
  options: string[];
  voteCounts: Record<string, number> & { total: number };
  petersChoice?: string | null;
  voteDate: string;
};

async function getFingerprint(): Promise<string> {
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || "",
    (navigator as unknown as { deviceMemory?: number }).deviceMemory || "",
    navigator.maxTouchPoints || 0,
  ];
  const raw = parts.join("|");
  const msgBuffer = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function VoteButtons({ categoryId, options, voteCounts, petersChoice, voteDate }: Props) {
  const [state, formAction, isPending] = useActionState(castVote, {});
  const [fingerprint, setFingerprint] = useState("");
  const [voted, setVoted] = useState<string | null>(null);

  useEffect(() => {
    getFingerprint().then(setFingerprint);
  }, []);

  const hasVotes = voteCounts.total > 0;

  // Find the winning option
  let maxVotes = 0;
  let winningIdx = "0";
  options.forEach((_, i) => {
    const key = String(i);
    const count = voteCounts[key] || 0;
    if (count > maxVotes) {
      maxVotes = count;
      winningIdx = key;
    }
  });

  // Resolve petersChoice to index
  let petersIdx: string | null = null;
  if (petersChoice === "left") petersIdx = "0";
  else if (petersChoice === "right") petersIdx = "1";
  else if (petersChoice) petersIdx = petersChoice;

  return (
    <div className="mt-5">
      <hr className="border-gray-100 mb-5" />
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ben jij het eens met Peter?</p>
      <div className={`grid gap-3 ${options.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : options.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
        {options.map((option, i) => {
          const key = String(i);
          const count = voteCounts[key] || 0;
          const percent = hasVotes ? Math.round((count / voteCounts.total) * 100) : 0;
          const isWinning = hasVotes && key === winningIdx;
          const isPetersChoice = key === petersIdx;
          const isVoted = voted === key;

          return (
            <form key={i} action={formAction} onSubmit={() => setVoted(key)}>
              <input type="hidden" name="category_id" value={categoryId} />
              <input type="hidden" name="vote" value={key} />
              <input type="hidden" name="fingerprint" value={fingerprint} />
              <input type="hidden" name="vote_date" value={voteDate} />
              <button
                type="submit"
                disabled={isPending || !fingerprint}
                className={`w-full relative overflow-hidden rounded-2xl px-5 py-5 sm:py-6 font-bold text-lg sm:text-xl transition-all duration-300 border-2 shadow-sm
                  ${isVoted
                    ? "gradient-kelly text-white border-kelly-500 shadow-lg shadow-kelly-500/30 scale-[1.02]"
                    : isPending
                      ? "border-gray-200 bg-gray-50 text-gray-400 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50"
                      : "border-kelly-200 bg-white text-gray-800 hover:border-kelly-400 hover:bg-kelly-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isPetersChoice && <span className="text-sm">&#9757;</span>}
                  {option}
                  {isVoted && <span className="text-sm">&#10003;</span>}
                </span>
                {hasVotes && (
                  <div className="mt-3 relative z-10">
                    <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isWinning ? "gradient-kelly" : "bg-gray-300"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className={`text-sm font-extrabold mt-1.5 block ${isVoted ? "text-white/90" : isWinning ? "text-kelly-600" : "text-gray-400"}`}>
                      {percent}%
                    </span>
                  </div>
                )}
              </button>
            </form>
          );
        })}
      </div>
      {state.error && (
        <p className="text-red-500 text-xs mt-3 bg-red-50 rounded-xl px-3 py-2 font-medium border border-red-100">
          {state.error}
        </p>
      )}
      {hasVotes && (
        <p className="text-sm text-gray-500 font-medium mt-3 text-center">
          {voteCounts.total} stem{voteCounts.total !== 1 ? "men" : ""}
        </p>
      )}
    </div>
  );
}
