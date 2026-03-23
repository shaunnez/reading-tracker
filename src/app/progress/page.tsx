export const dynamic = "force-dynamic";
import { getAssessments, getSessions, getPhonicsSkills } from "@/lib/actions";
import { getActiveChildId } from "@/lib/child-cookie";
import ProgressCharts from "./progress-charts";
import NoChildBanner from "@/components/no-child-banner";

export default async function ProgressPage() {
  const childId = await getActiveChildId();
  if (!childId) return <NoChildBanner />;
  const [assessments, sessions, skills] = await Promise.all([
    getAssessments(childId),
    getSessions(childId, 90),
    getPhonicsSkills(childId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Progress</h1>
        <p className="text-gray-500 text-sm">Charts and streaks over time</p>
      </div>
      <ProgressCharts assessments={assessments} sessions={sessions} skills={skills} />
    </div>
  );
}
