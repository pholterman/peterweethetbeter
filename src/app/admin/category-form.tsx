"use client";

import { useState } from "react";
import { addCategory } from "./actions";

export function CategoryForm() {
  const [options, setOptions] = useState(["", ""]);

  function addOption() {
    setOptions([...options, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  }

  function updateOption(index: number, value: string) {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  }

  return (
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

      <div>
        <label className="text-sm font-bold text-kelly-700 mb-2 block">Opties</label>
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                name={`option_${i}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Optie ${i + 1}`}
                className="flex-1 border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="text-red-400 hover:text-red-600 text-lg font-bold px-2 transition-colors"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addOption}
          className="mt-2 text-xs font-bold text-kelly-600 bg-kelly-50 border border-kelly-200 rounded-lg px-3 py-1.5 hover:bg-kelly-100 transition-colors"
        >
          + Optie toevoegen
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="is_daily"
          defaultChecked={true}
          className="rounded border-kelly-300 text-kelly-500 focus:ring-kelly-200"
        />
        <span>Dagelijks verlopend</span>
        <span className="text-xs text-gray-400">(uit = stelling blijft staan tot je hem wijzigt)</span>
      </label>

      <button
        type="submit"
        className="self-start bg-kelly-500 text-white font-bold text-sm rounded-xl px-5 py-2 hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md"
      >
        Categorie toevoegen
      </button>
    </form>
  );
}
