export const dynamic = "force-dynamic";
import { getAssessments, getSessions, getPhonicsSkills } from "@/lib/actions";
import ProgressCharts from "./progress-charts";

export default async function ProgressPage() {
  const [assessments, sessions, skills] = await Promise.all([
    getAssessments(),
    getSessions(90),
    getPhonicsSkills(),
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
