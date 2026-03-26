"use client";

import { useActionState } from "react";
import { castVote } from "@/app/actions/vote";

type Props = {
  categoryId: number;
  optionLeft: string;
  optionRight: string;
  voteCounts: { left: number; right: number; total: number };
};

export function VoteButtons({ categoryId, optionLeft, optionRight, voteCounts }: Props) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => {
      return await castVote(formData);
    },
    {}
  );

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
          <button
            type="submit"
            disabled={isPending}
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
          <button
            type="submit"
            disabled={isPending}
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
