"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(login, null);

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="text-center mb-6">
        <p className="text-5xl mb-3">&#128274;</p>
        <h1 className="text-3xl font-extrabold text-kelly-600">Admin Login</h1>
        <p className="text-gray-500 text-sm mt-1">Alleen voor Peter zelf!</p>
      </div>
      <form action={formAction} className="bg-white rounded-2xl border-2 border-kelly-200 p-6 shadow-md">
        <input
          type="password"
          name="password"
          placeholder="Wachtwoord"
          className="w-full border-2 border-kelly-200 rounded-xl px-4 py-3 mb-4 focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
          required
          autoFocus
        />
        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2 font-medium">
            &#128683; {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-kelly-500 text-white font-bold rounded-xl px-4 py-3 text-lg hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md disabled:opacity-50 disabled:hover:scale-100"
        >
          {isPending ? "Bezig... &#9203;" : "Inloggen &#128073;"}
        </button>
      </form>
    </div>
  );
}
