import { notFound } from "next/navigation";
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
      <h1 className="text-4xl font-extrabold mb-1 text-kelly-600 animate-bounce-in">{category.name}</h1>
      {category.description && (
        <p className="text-lg text-kelly-700 font-medium mb-6">{category.description}</p>
      )}

      {/* Today's verdict */}
      <section className="bg-white border-2 border-kelly-300 rounded-2xl p-6 mb-8 shadow-md">
        <h2 className="text-sm font-extrabold text-kelly-500 uppercase tracking-wide mb-2">&#128197; Vandaag</h2>
        {todayVerdict ? (
          <div>
            <p className="text-xl mb-1">
              <span className="text-kelly-500 font-bold">&#9757; Peter kiest:</span>{" "}
              <span className="font-extrabold text-kelly-700 text-2xl">
                {todayVerdict.verdict === "left"
                  ? category.option_left
                  : category.option_right}
              </span>
            </p>
            {todayVerdict.reason && (
              <p className="text-gray-600 text-sm italic mb-4 bg-kelly-50 rounded-xl px-4 py-2">
                &ldquo;{todayVerdict.reason}&rdquo;
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
      </section>

      {/* History */}
      {pastVerdicts.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold mb-4 text-kelly-700">&#128218; Geschiedenis</h2>
          <div className="space-y-3">
            {pastVerdicts.map((v) => (
              <div
                key={v.id}
                className="bg-white border-2 border-kelly-100 rounded-2xl p-4 text-sm hover:border-kelly-300 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">
                    {new Date(v.date).toLocaleDateString("nl-NL", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-extrabold text-kelly-600 bg-kelly-100 rounded-lg px-3 py-1">
                    {v.verdict === "left"
                      ? category.option_left
                      : category.option_right}
                  </span>
                </div>
                {v.reason && (
                  <p className="text-gray-500 italic mt-2 bg-kelly-50 rounded-lg px-3 py-1.5">
                    &ldquo;{v.reason}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
