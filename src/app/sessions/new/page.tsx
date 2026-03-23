export const dynamic = "force-dynamic";
import { getPhonicsSkills } from "@/lib/actions";
import { getActiveChildId } from "@/lib/child-cookie";
import SessionForm from "./session-form";
import NoChildBanner from "@/components/no-child-banner";

export default async function NewSessionPage() {
  const childId = await getActiveChildId();
  if (!childId) return <NoChildBanner />;
  const skills = await getPhonicsSkills(childId);
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Log a Session</h1>
      <p className="text-gray-500 text-sm mb-6">Takes under 30 seconds</p>
      <SessionForm skills={skills} childId={childId} />
    </div>
  );
}
