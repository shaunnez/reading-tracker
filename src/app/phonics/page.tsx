export const dynamic = "force-dynamic";
import Link from "next/link";
import { getPhonicsSkills } from "@/lib/actions";
import { getActiveChildId } from "@/lib/child-cookie";
import PhonicsMap from "./phonics-map";
import NoChildBanner from "@/components/no-child-banner";

export default async function PhonicsPage() {
  const childId = await getActiveChildId();
  if (!childId) return <NoChildBanner />;
  const skills = await getPhonicsSkills(childId);
  const anyStarted = skills.some((s) => s.status !== "not_started");
  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Phonics Map</h1>
          <p className="text-gray-500 text-sm">
            Tap a skill to mark it as in progress or mastered. Skills build on each other — work through them in order.
          </p>
        </div>
        <Link
          href="/phonics/placement"
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            anyStarted
              ? "border-gray-200 text-gray-600 hover:bg-gray-50"
              : "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          }`}
        >
          🧭 {anyStarted ? "Re-test" : "Placement test"}
        </Link>
      </div>
      <PhonicsMap skills={skills} childId={childId} />
    </div>
  );
}
