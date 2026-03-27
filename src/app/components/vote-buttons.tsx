"use client";

import { useActionState, useEffect, useState } from "react";
import { castVote } from "@/app/actions/vote";

type Props = {
  categoryId: number;
  optionLeft: string;
  optionRight: string;
  voteCounts: { left: number; right: number; total: number };
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

export function VoteButtons({ categoryId, optionLeft, optionRight, voteCounts }: Props) {
  const [state, formAction, isPending] = useActionState(castVote, {});
  const [fingerprint, setFingerprint] = useState("");

  useEffect(() => {
    getFingerprint().then(setFingerprint);
  }, []);

  const leftPercent =
    voteCounts.total > 0
      ? Math.round((voteCounts.left / voteCounts.total) * 100)
      : 0;
  const rightPercent =
    voteCounts.total > 0
      ? Math.round((voteCounts.right / voteCounts.total) * 100)
      : 0;

  return (
    <div className="mt-4">
      <p className="text-sm font-bold text-kelly-600 mb-2">Ben jij het eens met Peter?</p>
      <div className="flex gap-3">
        <form action={formAction} className="flex-1">
          <input type="hidden" name="category_id" value={categoryId} />
          <input type="hidden" name="vote" value="left" />
          <input type="hidden" name="fingerprint" value={fingerprint} />
          <button
            type="submit"
            disabled={isPending || !fingerprint}
            className="w-full bg-kelly-500 text-white font-bold rounded-xl px-4 py-4 text-base hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md disabled:opacity-50 disabled:hover:scale-100 animate-pulse-green"
          >
            {optionLeft}
            {voteCounts.total > 0 && (
              <span className="block text-sm font-extrabold mt-1">{leftPercent}%</span>
            )}
          </button>
        </form>
        <form action={formAction} className="flex-1">
          <input type="hidden" name="category_id" value={categoryId} />
          <input type="hidden" name="vote" value="right" />
          <input type="hidden" name="fingerprint" value={fingerprint} />
          <button
            type="submit"
            disabled={isPending || !fingerprint}
            className="w-full bg-kelly-500 text-white font-bold rounded-xl px-4 py-4 text-base hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md disabled:opacity-50 disabled:hover:scale-100 animate-pulse-green"
          >
            {optionRight}
            {voteCounts.total > 0 && (
              <span className="block text-sm font-extrabold mt-1">{rightPercent}%</span>
            )}
          </button>
        </form>
      </div>
      {state.error && (
        <p className="text-red-500 text-xs mt-2 bg-red-50 rounded-lg px-3 py-2 font-medium">
          &#128683; {state.error}
        </p>
      )}
      {voteCounts.total > 0 && (
        <p className="text-xs text-kelly-600 font-medium mt-2 text-center">
          &#128200; {voteCounts.total} stem{voteCounts.total !== 1 ? "men" : ""}
        </p>
      )}
    </div>
  );
}
