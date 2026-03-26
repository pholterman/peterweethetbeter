import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <p className="text-7xl mb-4">&#129335;</p>
      <h1 className="text-4xl font-extrabold text-kelly-600 mb-3">
        Pagina niet gevonden
      </h1>
      <p className="text-lg text-kelly-700 font-medium mb-8">
        Zelfs Peter weet niet wat je hier zoekt.
      </p>
      <Link
        href="/"
        className="inline-block bg-kelly-500 text-white font-bold rounded-xl px-6 py-3 text-lg hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md"
      >
        Terug naar de homepage &#128072;
      </Link>
    </div>
  );
}
