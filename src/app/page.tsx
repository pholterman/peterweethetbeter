import { getActiveCategories, getTodayVerdicts, getVoteCounts } from "@/lib/queries";
import { VerdictCard } from "./components/verdict-card";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function Home() {
  const [categories, verdicts] = await Promise.all([
    getActiveCategories(),
    getTodayVerdicts(),
  ]);

  const voteCountsMap = new Map<number, { left: number; right: number; total: number }>();
  const today = new Date().toISOString().split("T")[0];

  await Promise.all(
    categories.map(async (cat) => {
      const counts = await getVoteCounts(cat.id, today);
      voteCountsMap.set(cat.id, counts);
    })
  );

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-2 text-kelly-600">Vandaag &#128227;</h1>
        <p className="text-xl text-kelly-700 font-medium">
          Peter weet het altijd beter. Maar ben jij het met hem eens?
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-kelly-300">
          <p className="text-5xl mb-3">&#128566;</p>
          <p className="text-kelly-600 font-bold text-lg">Nog geen categorieën actief.</p>
          <p className="text-gray-400 text-sm mt-1">Peter is nog aan het nadenken...</p>
        </div>
      ) : (
        categories.map((category) => {
          const verdict = verdicts.find((v) => v.category_id === category.id) || null;
          const voteCounts = voteCountsMap.get(category.id) || {
            left: 0,
            right: 0,
            total: 0,
          };
          return (
            <VerdictCard
              key={category.id}
              category={category}
              verdict={verdict}
              voteCounts={voteCounts}
            />
          );
        })
      )}
    </div>
  );
}
