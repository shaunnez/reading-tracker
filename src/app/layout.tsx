import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/nav-bar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reading Tracker",
  description: "Track your daughter's reading progress",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <NavBar />
        <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">{children}</main>
      </body>
    </html>
  );
}
