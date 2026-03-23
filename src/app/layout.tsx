import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reading Tracker",
  description: "Track your daughter's reading progress",
};

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/sessions/new", label: "Log Session" },
  { href: "/phonics", label: "Phonics Map" },
  { href: "/progress", label: "Progress" },
  { href: "/books", label: "Books" },
  { href: "/assessments", label: "Assessments" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14">
            <Link href="/" className="font-semibold text-indigo-600 mr-4 text-sm shrink-0">
              📚 Reading Tracker
            </Link>
            <div className="flex gap-1 flex-wrap">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
