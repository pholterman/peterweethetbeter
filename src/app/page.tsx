import { getActiveCategories, getTodayVerdicts, getVoteCounts, getVerdictDate } from "@/lib/queries";
import { VerdictCard } from "./components/verdict-card";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function Home() {
  const [categories, verdicts] = await Promise.all([
    getActiveCategories(),
    getTodayVerdicts(),
  ]);

  const voteCountsMap = new Map<number, Record<string, number> & { total: number }>();

  await Promise.all(
    categories.map(async (cat) => {
      const date = getVerdictDate(cat);
      const counts = await getVoteCounts(cat.id, date);
      voteCountsMap.set(cat.id, counts);
    })
  );

  return (
    <div>
      <div className="text-center mb-12 animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          <span className="text-gradient">Vandaag</span>
        </h1>
        <p className="text-base text-gray-500 font-medium max-w-md mx-auto">
          Peter weet het altijd beter. Maar ben jij het met hem eens?
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl animate-scale-in">
          <p className="text-5xl mb-4">&#128566;</p>
          <p className="text-gray-700 font-bold text-lg">Nog geen categorieën actief</p>
          <p className="text-gray-500 text-sm mt-1">Peter is nog aan het nadenken...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category, i) => {
            const verdict = verdicts.find((v) => v.category_id === category.id) || null;
            const voteCounts = voteCountsMap.get(category.id) || { total: 0 };
            return (
              <div key={category.id} style={{ animationDelay: `${i * 100}ms` }} className="animate-fade-up">
                <VerdictCard
                  category={category}
                  verdict={verdict}
                  voteCounts={voteCounts}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
