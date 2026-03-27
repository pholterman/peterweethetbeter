import Link from "next/link";
import { Category, Verdict, VoteCounts } from "@/lib/queries";
import { VoteButtons } from "./vote-buttons";

type Props = {
  category: Category;
  verdict: Verdict | null;
  voteCounts: VoteCounts;
};

export function VerdictCard({ category, verdict, voteCounts }: Props) {
  const winnerLabel =
    verdict?.verdict === "left"
      ? category.option_left
      : verdict?.verdict === "right"
      ? category.option_right
      : null;

  return (
    <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-lg shadow-kelly-500/5 hover:shadow-xl hover:shadow-kelly-500/10 hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Link href={`/${category.slug}`}>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 group-hover:text-kelly-600 transition-colors">
              {category.name}
            </h2>
          </Link>
          {category.description && (
            <p className="text-gray-500 text-sm mt-1">{category.description}</p>
          )}
        </div>
        <Link
          href={`/${category.slug}`}
          className="text-xs text-gray-500 hover:text-kelly-500 transition-colors bg-gray-100 hover:bg-kelly-50 rounded-full px-3 py-1.5 font-medium shrink-0 ml-4 group/link"
        >
          Geschiedenis <span className="inline-block group-hover/link:translate-x-0.5 transition-transform">&rarr;</span>
        </Link>
      </div>

      {verdict ? (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl gradient-kelly flex items-center justify-center text-white text-base shadow-md shadow-kelly-500/30">
              &#9757;
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Peter kiest vandaag</p>
              <p className="font-extrabold text-xl sm:text-2xl text-gray-900">{winnerLabel}</p>
            </div>
          </div>
          {verdict.reason && (
            <p className="text-gray-500 text-sm italic mb-1 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
              &ldquo;{verdict.reason}&rdquo;
            </p>
          )}
          <VoteButtons
            categoryId={category.id}
            optionLeft={category.option_left}
            optionRight={category.option_right}
            voteCounts={voteCounts}
            petersChoice={verdict.verdict as "left" | "right"}
          />
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-4xl mb-2 animate-bounce">&#129300;</p>
          <p className="text-gray-500 font-medium">
            Peter heeft zich nog niet uitgesproken vandaag
          </p>
        </div>
      )}
    </div>
  );
}
