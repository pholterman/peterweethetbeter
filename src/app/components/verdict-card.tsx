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
    <div className="bg-white border-2 border-kelly-300 rounded-2xl p-6 mb-6 shadow-md hover:shadow-lg hover:border-kelly-400 hover:-translate-y-1 transition-all duration-200 animate-slide-up">
      <Link href={`/${category.slug}`}>
        <h2 className="text-2xl font-extrabold mb-1 text-kelly-600 hover:text-kelly-500 transition-colors">
          {category.name}
        </h2>
      </Link>
      {category.description && (
        <p className="text-gray-500 text-sm mb-4">{category.description}</p>
      )}

      {verdict ? (
        <div>
          <p className="mb-2 text-lg">
            <span className="text-kelly-500 font-bold">&#9757; Peter kiest vandaag:</span>{" "}
            <span className="font-extrabold text-kelly-700 text-xl">{winnerLabel}</span>
          </p>
          {verdict.reason && (
            <p className="text-gray-600 text-sm italic mb-4 bg-kelly-50 rounded-xl px-4 py-2">
              &ldquo;{verdict.reason}&rdquo;
            </p>
          )}
          <VoteButtons
            categoryId={category.id}
            optionLeft={category.option_left}
            optionRight={category.option_right}
            voteCounts={voteCounts}
          />
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-4xl mb-2">&#129300;</p>
          <p className="text-gray-400 font-medium">
            Peter heeft zich nog niet uitgesproken vandaag.
          </p>
        </div>
      )}
    </div>
  );
}
