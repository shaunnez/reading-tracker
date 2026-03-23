"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import AssessmentRunner, { type AssessmentMode } from "./assessment-runner";
import { createAssessment, deleteAssessment } from "@/lib/actions";
import { useRouter } from "next/navigation";

const TYPE_LABELS: Record<string, string> = {
  wcpm: "Words/Min (WPM)",
  sounds_known: "Letter Sounds Known",
  words_decoded: "Words Decoded",
  sight_words: "Sight Words Known",
};

const GRADE1_BENCHMARKS = [
  { label: "3 months", value: 30 },
  { label: "6 months", value: 70 },
  { label: "9 months", value: 85 },
  { label: "12 months", value: 90 },
];

type Assessment = {
  id: number;
  type: string;
  date: string;
  value: number;
  notes?: string | null;
};

interface Props {
  childId: string;
  grouped: Record<string, Assessment[]>;
}

const TYPE_CARDS: { mode: AssessmentMode | "manual"; label: string; emoji: string; desc: string }[] = [
  { mode: "wpm",        label: "Words Per Minute",    emoji: "⏱️", desc: "Timed 1-minute reading test" },
  { mode: "sounds",     label: "Letter Sounds Known", emoji: "🔤", desc: "26 letters — child says the sound" },
  { mode: "sightwords", label: "Sight Words Known",   emoji: "👁️", desc: "Dolch pre-primer list with pictures" },
  { mode: "manual",     label: "Words Decoded (CVC)", emoji: "📝", desc: "Enter score manually (out of 10)" },
];

export default function AssessmentPageClient({ childId, grouped }: Props) {
  const router = useRouter();
  const [runnerMode, setRunnerMode] = useState<AssessmentMode | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualLoading, setManualLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  async function handleManualSave() {
    if (!manualValue) return;
    setManualLoading(true);
    try {
      await createAssessment({ childId, date: manualDate, type: "words_decoded", value: parseFloat(manualValue) });
      setManualValue("");
      setShowManual(false);
      router.refresh();
    } finally {
      setManualLoading(false);
    }
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteAssessment(id, childId);
      setDeleteConfirm(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Runner modal */}
      {runnerMode && (
        <AssessmentRunner
          mode={runnerMode}
          childId={childId}
          onClose={() => setRunnerMode(null)}
        />
      )}

      {/* Type cards */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Start an Assessment</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TYPE_CARDS.map((card) => (
            <button
              key={card.mode}
              onClick={() => {
                if (card.mode === "manual") { setShowManual((v) => !v); }
                else { setRunnerMode(card.mode as AssessmentMode); }
              }}
              className="flex flex-col items-center text-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-3xl">{card.emoji}</span>
              <span className="text-xs font-semibold text-gray-800 leading-tight">{card.label}</span>
              <span className="text-xs text-gray-400 leading-tight">{card.desc}</span>
            </button>
          ))}
        </div>

        {/* Manual CVC entry */}
        {showManual && (
          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <p className="text-sm font-semibold text-gray-700">CVC Words Decoded (out of 10)</p>
            <div className="flex gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Date</label>
                <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Score (0–10)</label>
                <input type="number" min="0" max="10" value={manualValue} onChange={(e) => setManualValue(e.target.value)}
                  placeholder="e.g. 8"
                  className="w-24 px-3 py-2 border border-gray-200 rounded-md text-sm bg-white" />
              </div>
              <Button onClick={handleManualSave} disabled={manualLoading || !manualValue} size="sm">
                {manualLoading ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Benchmarks */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Grade 1 WPM Targets</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            {GRADE1_BENCHMARKS.map((b) => (
              <div key={b.label} className="flex justify-between text-sm">
                <span className="text-gray-500">{b.label}:</span>
                <span className="font-medium">{b.value}+ wpm</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {Object.entries(grouped).map(([type, entries]) => (
        <Card key={type}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{TYPE_LABELS[type] ?? type}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[...entries].reverse().map((a) => (
                <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0 gap-2">
                  <span className="text-sm text-gray-600">{a.date}</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="font-semibold text-gray-900">
                      {type === "wcpm" ? `${a.value} wpm` : a.value}
                    </span>
                    {type === "wcpm" && (
                      <Badge variant={a.value >= 30 ? "secondary" : "outline"} className="text-xs">
                        {a.value >= 90 ? "On Grade" : a.value >= 60 ? "Good" : a.value >= 30 ? "Building" : "Early"}
                      </Badge>
                    )}
                    {deleteConfirm === a.id ? (
                      <div className="flex gap-1 items-center">
                        <span className="text-xs text-gray-500">Delete?</span>
                        <button onClick={() => handleDelete(a.id)}
                          className="text-xs text-red-600 hover:underline font-medium">Confirm</button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-gray-400 hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(a.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-0.5">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📊</p>
          <p>No assessments yet. Start one above.</p>
        </div>
      )}
    </div>
  );
}
