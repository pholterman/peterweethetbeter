import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Peter weet het beter",
  description: "Peter weet het altijd beter. Maar ben jij het met hem eens?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={`${inter.className} bg-kelly-50 text-gray-900 min-h-screen`}>
        <header className="bg-kelly-500 shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-5">
            <Link href="/" className="group flex items-center gap-3">
              <span className="text-4xl" role="img" aria-label="wijzend">&#9757;</span>
              <span className="text-3xl font-extrabold text-white group-hover:scale-105 transition-transform">
                Peter weet het beter
              </span>
            </Link>
            <p className="text-kelly-100 text-sm mt-1 font-medium">
              Dagelijks een mening. Altijd gelijk. Toch?
            </p>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-kelly-500 mt-16">
          <div className="max-w-2xl mx-auto px-4 py-6 text-sm text-kelly-100 font-medium">
            &copy; {new Date().getFullYear()} Peter weet het beter &mdash; altijd gelijk, nooit bescheiden
          </div>
        </footer>
      </body>
    </html>
  );
}
