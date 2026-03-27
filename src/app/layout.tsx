import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "800"] });

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
      <body className={`${dmSans.className} bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-kelly-50/50 via-gray-50 to-gray-100 text-gray-900 min-h-screen flex flex-col`}>
        <header className="gradient-hero sticky top-0 z-50 shadow-lg shadow-kelly-500/20">
          <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                &#9757;
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight">
                  Peter weet het beter
                </span>
                <span className="hidden sm:block text-xs text-white/70 font-medium">
                  Dagelijks een mening. Altijd gelijk.
                </span>
              </div>
            </Link>
          </div>
        </header>
        <main className="max-w-3xl mx-auto w-full px-5 py-8 flex-1">
          {children}
        </main>
        <footer className="gradient-dark">
          <div className="max-w-3xl mx-auto px-5 py-6 flex items-center justify-between">
            <span className="text-sm text-kelly-300/60 font-medium">
              &copy; {new Date().getFullYear()} Peter weet het beter
            </span>
            <span className="text-xs text-kelly-300/40">
              Altijd gelijk, nooit bescheiden
            </span>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
