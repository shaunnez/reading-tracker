export const dynamic = "force-dynamic";
import { getAssessments } from "@/lib/actions";
import { getActiveChildId } from "@/lib/child-cookie";
import NoChildBanner from "@/components/no-child-banner";
import AssessmentPageClient from "./assessment-page-client";

export default async function AssessmentsPage() {
  const childId = await getActiveChildId();
  if (!childId) return <NoChildBanner />;
  const allAssessments = await getAssessments(childId);

  const grouped = allAssessments.reduce<Record<string, typeof allAssessments>>((acc, a) => {
    if (!acc[a.type]) acc[a.type] = [];
    acc[a.type].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Assessments</h1>
        <p className="text-gray-500 text-sm">Run assessments to track progress over time. Aim for monthly.</p>
      </div>
      <AssessmentPageClient childId={childId} grouped={grouped} />
    </div>
  );
}
