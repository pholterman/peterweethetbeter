import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCategoryBySlug,
  getVoteCounts,
  getVerdictHistory,
  getLatestVerdict,
  getOptions,
  resolveVerdictLabel,
  getVerdictDate,
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

  const options = getOptions(category);
  const voteDate = getVerdictDate(category);

  let todayVerdict;
  if (category.is_daily) {
    const history = await getVerdictHistory(category.id);
    const today = new Date().toISOString().split("T")[0];
    todayVerdict = history.find((v) => v.date === today) || null;
  } else {
    todayVerdict = await getLatestVerdict(category.id);
  }

  const history = category.is_daily ? await getVerdictHistory(category.id) : [];
  const today = new Date().toISOString().split("T")[0];
  const pastVerdicts = history.filter((v) => v.date !== today);
  const voteCounts = await getVoteCounts(category.id, voteDate);

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-kelly-500 font-medium mb-6 transition-colors"
      >
        &larr; Alle categorieën
      </Link>

      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="text-gradient">{category.name}</span>
          </h1>
          {!category.is_daily && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              Permanent
            </span>
          )}
        </div>
        {category.description && (
          <p className="text-lg text-gray-500 font-medium mt-2">{category.description}</p>
        )}
      </div>

      {/* Today's / Current verdict */}
      <section className="glass-strong rounded-3xl p-6 sm:p-8 mb-8 shadow-lg shadow-kelly-500/5 animate-scale-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-kelly-400 animate-pulse" />
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {category.is_daily ? "Vandaag" : "Huidige keuze"}
          </h2>
        </div>
        {todayVerdict ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl gradient-kelly flex items-center justify-center text-white text-sm shadow-md shadow-kelly-500/30">
                &#9757;
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  {category.is_daily ? "Peter kiest" : "Peter vindt"}
                </p>
                <p className="font-extrabold text-2xl text-gray-900">
                  {resolveVerdictLabel(category, todayVerdict.verdict)}
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
              options={options}
              voteCounts={voteCounts}
              petersChoice={todayVerdict.verdict}
              voteDate={voteDate}
            />
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-4xl mb-2 animate-bounce">&#129300;</p>
            <p className="text-gray-500 font-medium">
              Peter heeft zich nog niet uitgesproken{category.is_daily ? " vandaag" : ""}
            </p>
          </div>
        )}
      </section>

      {/* History (only for daily categories) */}
      {category.is_daily && pastVerdicts.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Geschiedenis</h2>
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
                  {resolveVerdictLabel(category, v.verdict)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
