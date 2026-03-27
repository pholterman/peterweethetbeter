import { sql } from "@/lib/db";
import { Category, Verdict, getOptions, resolveVerdictLabel } from "@/lib/queries";
import { logout, submitVerdict, toggleCategory } from "./actions";
import { CategoryForm } from "./category-form";

export const dynamic = "force-dynamic";

export async function AdminDashboard() {
  const categories = await sql`
    SELECT id, slug, name, description, option_left, option_right, options, is_daily, is_active
    FROM categories ORDER BY created_at ASC
  ` as Category[];

  const todayVerdicts = await sql`
    SELECT dv.id, dv.category_id, dv.date::text, dv.verdict, dv.reason
    FROM daily_verdicts dv
    JOIN categories c ON c.id = dv.category_id
    WHERE (c.is_daily = true AND dv.date = CURRENT_DATE)
       OR (c.is_daily = false AND dv.date = '9999-12-31'::date)
  ` as Verdict[];

  const verdictMap = new Map(
    todayVerdicts.map((v) => [v.category_id, v])
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-kelly-600">Admin</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm font-medium text-kelly-600 bg-kelly-100 rounded-lg px-3 py-1.5 hover:bg-kelly-200 transition-colors"
          >
            Uitloggen
          </button>
        </form>
      </div>

      {/* Submit verdicts */}
      <section className="mb-12">
        <h2 className="text-xl font-extrabold text-kelly-700 mb-4">Dagelijks oordeel</h2>
        {categories.filter((c: Category) => c.is_active).length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border-2 border-dashed border-kelly-300">
            <p className="text-kelly-600 font-bold">Geen actieve categorieën. Voeg er een toe!</p>
          </div>
        ) : (
          categories
            .filter((c: Category) => c.is_active)
            .map((cat: Category) => {
              const existing = verdictMap.get(cat.id);
              const options = getOptions(cat);
              return (
                <div key={cat.id} className="bg-white border-2 border-kelly-200 rounded-2xl p-5 mb-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-extrabold text-lg text-kelly-700">{cat.name}</h3>
                    {!cat.is_daily && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        Permanent
                      </span>
                    )}
                  </div>
                  {existing && (
                    <p className="text-sm text-gray-500 mb-2">
                      Huidige keuze: <strong>{resolveVerdictLabel(cat, existing.verdict)}</strong>
                      {existing.reason && <span> — &ldquo;{existing.reason}&rdquo;</span>}
                    </p>
                  )}
                  <form action={submitVerdict} className="flex flex-col gap-2">
                    <input type="hidden" name="category_id" value={cat.id} />
                    <input type="hidden" name="is_daily" value={String(cat.is_daily)} />
                    <div className="flex flex-wrap gap-3">
                      {options.map((option, idx) => (
                        <label key={idx} className="flex items-center gap-1.5 text-sm">
                          <input
                            type="radio"
                            name="verdict"
                            value={String(idx)}
                            defaultChecked={
                              existing?.verdict === String(idx) ||
                              (existing?.verdict === "left" && idx === 0) ||
                              (existing?.verdict === "right" && idx === 1)
                            }
                            required
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                    <input
                      type="text"
                      name="reason"
                      placeholder="Waarom? (optioneel)"
                      defaultValue={existing?.reason || ""}
                      className="border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
                    />
                    <button
                      type="submit"
                      className="self-start bg-kelly-500 text-white font-bold text-sm rounded-xl px-5 py-2 hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md"
                    >
                      {existing ? "Wijzigen" : "Opslaan"}
                    </button>
                  </form>
                </div>
              );
            })
        )}
      </section>

      {/* Add category */}
      <section className="mb-12">
        <h2 className="text-xl font-extrabold text-kelly-700 mb-4">Nieuwe categorie</h2>
        <CategoryForm />
      </section>

      {/* Manage categories */}
      <section>
        <h2 className="text-xl font-extrabold text-kelly-700 mb-4">Categorieën beheren</h2>
        {categories.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-2xl border-2 border-dashed border-kelly-300">
            <p className="text-gray-500 font-medium">Nog geen categorieën.</p>
          </div>
        ) : (
          categories.map((cat: Category) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-white border-2 border-kelly-200 rounded-2xl p-4 mb-2 shadow-sm"
            >
              <div>
                <span className={cat.is_active ? "font-bold text-kelly-700" : "text-gray-400 line-through"}>
                  {cat.name}
                </span>
                <span className="text-xs text-kelly-400 ml-2 font-medium">/{cat.slug}</span>
                {!cat.is_daily && (
                  <span className="text-xs text-amber-500 ml-2">permanent</span>
                )}
                <span className="text-xs text-gray-400 ml-2">
                  {getOptions(cat).length} opties
                </span>
              </div>
              <form action={toggleCategory}>
                <input type="hidden" name="category_id" value={cat.id} />
                <input type="hidden" name="is_active" value={String(cat.is_active)} />
                <button
                  type="submit"
                  className={`text-xs font-bold rounded-lg px-3 py-1.5 transition-all ${
                    cat.is_active
                      ? "text-red-600 bg-red-50 hover:bg-red-100"
                      : "text-kelly-600 bg-kelly-100 hover:bg-kelly-200"
                  }`}
                >
                  {cat.is_active ? "Deactiveren" : "Activeren"}
                </button>
              </form>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
