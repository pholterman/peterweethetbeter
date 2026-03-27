import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20 animate-fade-up">
      <p className="text-8xl mb-6">&#129335;</p>
      <h1 className="text-4xl font-extrabold tracking-tight mb-3">
        <span className="text-gradient">Pagina niet gevonden</span>
      </h1>
      <p className="text-lg text-gray-400 font-medium mb-10 max-w-sm mx-auto">
        Zelfs Peter weet niet wat je hier zoekt.
      </p>
      <Link
        href="/"
        className="inline-block gradient-kelly text-white font-bold rounded-2xl px-8 py-4 text-lg hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-kelly-500/30"
      >
        Terug naar de homepage &larr;
      </Link>
    </div>
  );
}
