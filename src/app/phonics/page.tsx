export const dynamic = "force-dynamic";
import { getPhonicsSkills } from "@/lib/actions";
import PhonicsMap from "./phonics-map";

export default async function PhonicsPage() {
  const skills = await getPhonicsSkills();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Phonics Map</h1>
      <p className="text-gray-500 text-sm mb-6">
        Tap a skill to mark it as in progress or mastered. Skills build on each other — work through them in order.
      </p>
      <PhonicsMap skills={skills} />
    </div>
  );
}
