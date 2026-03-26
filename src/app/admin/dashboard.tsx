import { sql } from "@/lib/db";
import { Category, Verdict } from "@/lib/queries";
import { logout, submitVerdict, addCategory, toggleCategory } from "./actions";

export async function AdminDashboard() {
  const categories = await sql`
    SELECT id, slug, name, description, option_left, option_right, is_active
    FROM categories ORDER BY created_at ASC
  ` as Category[];

  const todayVerdicts = await sql`
    SELECT category_id, verdict, reason
    FROM daily_verdicts WHERE date = CURRENT_DATE
  ` as Verdict[];

  const verdictMap = new Map(
    todayVerdicts.map((v) => [v.category_id, v])
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-kelly-600">&#128736; Admin</h1>
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
        <h2 className="text-xl font-extrabold text-kelly-700 mb-4">&#128227; Dagelijks oordeel</h2>
        {categories.filter((c: Category) => c.is_active).length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border-2 border-dashed border-kelly-300">
            <p className="text-4xl mb-2">&#128566;</p>
            <p className="text-kelly-600 font-bold">Geen actieve categorieën. Voeg er een toe!</p>
          </div>
        ) : (
          categories
            .filter((c: Category) => c.is_active)
            .map((cat: Category) => {
              const existing = verdictMap.get(cat.id);
              return (
                <div key={cat.id} className="bg-white border-2 border-kelly-200 rounded-2xl p-5 mb-4 shadow-sm">
                  <h3 className="font-extrabold text-lg text-kelly-700 mb-2">{cat.name}</h3>
                  {existing && (
                    <p className="text-sm text-gray-500 mb-2">
                      Huidige keuze: <strong>{existing.verdict === "left" ? cat.option_left : cat.option_right}</strong>
                      {existing.reason && <span> — &ldquo;{existing.reason}&rdquo;</span>}
                    </p>
                  )}
                  <form action={submitVerdict} className="flex flex-col gap-2">
                    <input type="hidden" name="category_id" value={cat.id} />
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="verdict"
                          value="left"
                          defaultChecked={existing?.verdict === "left"}
                          required
                        />
                        {cat.option_left}
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="verdict"
                          value="right"
                          defaultChecked={existing?.verdict === "right"}
                        />
                        {cat.option_right}
                      </label>
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
                      {existing ? "Wijzigen &#9999;" : "Opslaan &#128190;"}
                    </button>
                  </form>
                </div>
              );
            })
        )}
      </section>

      {/* Add category */}
      <section className="mb-12">
        <h2 className="text-xl font-extrabold text-kelly-700 mb-4">&#10133; Nieuwe categorie</h2>
        <form action={addCategory} className="bg-white border-2 border-kelly-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
          <input
            type="text"
            name="name"
            placeholder="Naam (bijv. Koffiemachine)"
            className="border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
            required
          />
          <input
            type="text"
            name="slug"
            placeholder="Slug (bijv. koffiemachine)"
            className="border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
            required
            pattern="[a-z0-9\-]+"
            title="Alleen kleine letters, cijfers en streepjes"
          />
          <input
            type="text"
            name="description"
            placeholder="Beschrijving (optioneel)"
            className="border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
          />
          <div className="flex gap-2">
            <input
              type="text"
              name="option_left"
              placeholder="Optie links"
              className="flex-1 border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
              required
            />
            <input
              type="text"
              name="option_right"
              placeholder="Optie rechts"
              className="flex-1 border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="self-start bg-kelly-500 text-white font-bold text-sm rounded-xl px-5 py-2 hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md"
          >
            Categorie toevoegen &#128640;
          </button>
        </form>
      </section>

      {/* Manage categories */}
      <section>
        <h2 className="text-xl font-extrabold text-kelly-700 mb-4">&#128221; Categorieën beheren</h2>
        {categories.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-2xl border-2 border-dashed border-kelly-300">
            <p className="text-gray-400 font-medium">Nog geen categorieën.</p>
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
