export const dynamic = "force-dynamic";
import { getPhonicsSkills } from "@/lib/actions";
import SessionForm from "./session-form";

export default async function NewSessionPage() {
  const skills = await getPhonicsSkills();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Log a Session</h1>
      <p className="text-gray-500 text-sm mb-6">Takes under 30 seconds</p>
      <SessionForm skills={skills} />
    </div>
  );
}
