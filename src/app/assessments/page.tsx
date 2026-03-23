export const dynamic = "force-dynamic";
import { getAssessments } from "@/lib/actions";
import AssessmentForm from "./assessment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS: Record<string, string> = {
  wcpm: "Words/Min (WPM)",
  sounds_known: "Letter Sounds Known",
  words_decoded: "Words Decoded",
  sight_words: "Sight Words Known",
};

const GRADE1_BENCHMARKS: Record<string, { label: string; value: number }[]> = {
  wcpm: [
    { label: "3 months", value: 30 },
    { label: "6 months", value: 70 },
    { label: "9 months", value: 85 },
    { label: "12 months", value: 90 },
  ],
  sounds_known: [
    { label: "3 months", value: 26 },
    { label: "6 months", value: 26 },
  ],
};

export default async function AssessmentsPage() {
  const allAssessments = await getAssessments();

  const grouped = allAssessments.reduce<Record<string, typeof allAssessments>>((acc, a) => {
    if (!acc[a.type]) acc[a.type] = [];
    acc[a.type].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Assessments</h1>
        <p className="text-gray-500 text-sm">Log periodic benchmarks to track progress over time. Aim for monthly.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">Log New Assessment</h2>
          <AssessmentForm />
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-gray-700">Benchmarks (Grade 1 targets)</h2>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Words Per Minute (WPM)</p>
              <div className="space-y-1">
                {(GRADE1_BENCHMARKS.wcpm || []).map((b) => (
                  <div key={b.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{b.label}:</span>
                    <span className="font-medium">{b.value}+ wpm</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assessment history */}
      {Object.entries(grouped).map(([type, entries]) => (
        <Card key={type}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{TYPE_LABELS[type] ?? type}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[...entries].reverse().map((a) => (
                <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{a.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {type === "wcpm" ? `${a.value} wpm` : a.value}
                    </span>
                    {type === "wcpm" && (
                      <Badge variant={a.value >= 30 ? "secondary" : "outline"} className="text-xs">
                        {a.value >= 90 ? "On Grade" : a.value >= 60 ? "Good" : a.value >= 30 ? "Building" : "Early"}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {allAssessments.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📊</p>
          <p>No assessments yet. Log your first one above.</p>
          <p className="text-sm mt-1">Tip: Do a 1-minute timed reading once a month and record the WPM.</p>
        </div>
      )}
    </div>
  );
}
