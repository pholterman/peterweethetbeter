import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCategoryBySlug,
  getVoteCounts,
  getVerdictHistory,
} from "@/lib/queries";
import { VoteButtons } from "../components/vote-buttons";

export const dynamic = "force-dynamic";
export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} — Peter weet het beter`,
    description: category.description || `Peter's mening over ${category.name}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const history = await getVerdictHistory(category.id);
  const today = new Date().toISOString().split("T")[0];
  const todayVerdict = history.find((v) => v.date === today) || null;
  const pastVerdicts = history.filter((v) => v.date !== today);
  const voteCounts = await getVoteCounts(category.id, today);

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-kelly-500 font-medium mb-6 transition-colors"
      >
        &larr; Alle categorieën
      </Link>

      <div className="mb-8 animate-fade-up">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          <span className="text-gradient">{category.name}</span>
        </h1>
        {category.description && (
          <p className="text-lg text-gray-500 font-medium mt-2">{category.description}</p>
        )}
      </div>

      {/* Today's verdict */}
      <section className="glass-strong rounded-3xl p-6 sm:p-8 mb-8 shadow-lg shadow-kelly-500/5 animate-scale-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-kelly-400 animate-pulse" />
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vandaag</h2>
        </div>
        {todayVerdict ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl gradient-kelly flex items-center justify-center text-white text-sm shadow-md shadow-kelly-500/30">
                &#9757;
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Peter kiest</p>
                <p className="font-extrabold text-2xl text-gray-900">
                  {todayVerdict.verdict === "left"
                    ? category.option_left
                    : category.option_right}
                </p>
              </div>
            </div>
            {todayVerdict.reason && (
              <p className="text-gray-500 text-sm italic mb-5 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                &ldquo;{todayVerdict.reason}&rdquo;
              </p>
            )}
            <VoteButtons
              categoryId={category.id}
              optionLeft={category.option_left}
              optionRight={category.option_right}
              voteCounts={voteCounts}
              petersChoice={todayVerdict.verdict as "left" | "right"}
            />
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-4xl mb-2">&#129300;</p>
            <p className="text-gray-400 font-medium">
              Peter heeft zich nog niet uitgesproken vandaag
            </p>
          </div>
        )}
      </section>

      {/* History */}
      {pastVerdicts.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Geschiedenis</h2>
          <div className="space-y-2">
            {pastVerdicts.map((v) => (
              <div
                key={v.id}
                className="glass-strong rounded-2xl px-5 py-4 flex items-center justify-between hover:shadow-md transition-all duration-200"
              >
                <div>
                  <span className="text-sm text-gray-500 font-medium">
                    {new Date(v.date).toLocaleDateString("nl-NL", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  {v.reason && (
                    <p className="text-xs text-gray-400 italic mt-0.5">
                      &ldquo;{v.reason}&rdquo;
                    </p>
                  )}
                </div>
                <span className="font-bold text-sm text-kelly-700 bg-kelly-50 border border-kelly-200 rounded-xl px-3 py-1.5">
                  {v.verdict === "left"
                    ? category.option_left
                    : category.option_right}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
