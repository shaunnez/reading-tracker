export const dynamic = "force-dynamic";

import Link from "next/link";
import { getPhonicsSkills } from "@/lib/actions";
import { getActiveChildId } from "@/lib/child-cookie";
import PlacementTest from "./placement-test";
import NoChildBanner from "@/components/no-child-banner";

export default async function PlacementPage() {
  const childId = await getActiveChildId();
  if (!childId) return <NoChildBanner />;
  const skills = await getPhonicsSkills(childId);
  return (
    <div className="max-w-lg mx-auto px-4 pb-12">
      <Link href="/phonics" className="text-sm text-indigo-600 hover:underline inline-block mb-4">
        ← Back to Phonics Map
      </Link>
      <PlacementTest skills={skills} childId={childId} />
    </div>
  );
}
