export const dynamic = "force-dynamic";

import Link from "next/link";
import { getPhonicsSkills } from "@/lib/actions";
import PlacementTest from "./placement-test";

export default async function PlacementPage() {
  const skills = await getPhonicsSkills();
  return (
    <div className="max-w-lg mx-auto px-4 pb-12">
      <Link href="/phonics" className="text-sm text-indigo-600 hover:underline inline-block mb-4">
        ← Back to Phonics Map
      </Link>
      <PlacementTest skills={skills} />
    </div>
  );
}
