export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { getSkillById, getResources } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";

const PHASE_LABELS: Record<number, string> = {
  1: "Phase 1 — Foundation (Months 1–3)",
  2: "Phase 2 — Consolidation (Months 4–6)",
  3: "Phase 3 — Expansion (Months 7–9)",
  4: "Phase 4 — Independence (Months 10–12)",
};

const STATUS_STYLES: Record<string, string> = {
  not_started: "outline",
  in_progress: "default",
  mastered: "secondary",
} as const;

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  mastered: "Mastered ✓",
};

type Props = { params: Promise<{ id: string }> };

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  const skill = await getSkillById(parseInt(id, 10));
  if (!skill) notFound();

  const matchingResources = await getResources(skill.sequenceOrder, skill.sequenceOrder);

  const wordList = skill.wordList ? skill.wordList.split(",").map((w) => w.trim()) : [];
  const dictationWords = skill.dictationWords
    ? skill.dictationWords.split(",").map((w) => w.trim())
    : [];
  const examples = skill.examples ? skill.examples.split(",").map((w) => w.trim()) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back nav */}
      <Link href="/phonics" className="text-sm text-indigo-600 hover:underline">
        ← Back to Phonics Map
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-400 text-sm">Skill #{skill.sequenceOrder}</span>
          <Badge variant={STATUS_STYLES[skill.status] as "default" | "secondary" | "outline"}>
            {STATUS_LABELS[skill.status]}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{PHASE_LABELS[skill.phase]}</p>
      </div>

      {/* Example words */}
      {examples.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {examples.map((w) => (
            <span key={w} className="px-2 py-1 bg-gray-100 rounded font-mono text-sm">
              {w}
            </span>
          ))}
        </div>
      )}

      {/* Session plan */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5 space-y-5">
        <h2 className="font-semibold text-indigo-900">Today&apos;s Lesson Plan</h2>

        {skill.warmup && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700 mb-2">
              Minutes 1–3 · Warm-up
            </h3>
            <p className="text-sm text-gray-800 leading-relaxed">{skill.warmup}</p>
          </section>
        )}

        {skill.introduction && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700 mb-2">
              Minutes 4–8 · Introduction
            </h3>
            <p className="text-sm text-gray-800 leading-relaxed">{skill.introduction}</p>
          </section>
        )}

        {wordList.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700 mb-2">
              Minutes 9–12 · Practice Word List ({wordList.length} words)
            </h3>
            <div className="flex flex-wrap gap-2">
              {wordList.map((w) => (
                <span
                  key={w}
                  className="px-3 py-1.5 bg-white border border-indigo-200 rounded-lg font-mono text-sm text-gray-800"
                >
                  {w}
                </span>
              ))}
            </div>
          </section>
        )}

        {dictationWords.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700 mb-2">
              Minutes 13–15 · Dictation (you say, she writes)
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              Say each word clearly. She writes it without seeing it. Then show her and discuss any errors.
            </p>
            <div className="flex gap-3 flex-wrap">
              {dictationWords.map((w, i) => (
                <span key={w} className="px-3 py-2 bg-white border border-dashed border-indigo-300 rounded-lg font-mono text-sm font-medium">
                  {i + 1}. {w}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Tips for parents */}
      {skill.tipsForParents && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">
            Parent Notes
          </h3>
          <p className="text-sm text-amber-900 leading-relaxed">{skill.tipsForParents}</p>
        </div>
      )}

      {/* Related resources */}
      {matchingResources.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Matching Books &amp; Resources</h2>
          <div className="space-y-2">
            {matchingResources.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-gray-200 bg-white p-3 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                    {r.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Badge variant="outline" className="text-xs capitalize">
                      {r.type}
                    </Badge>
                    {r.isFree === 1 && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Free
                      </Badge>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer: decodable reading reminder */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
        <strong>After word practice:</strong> Read a decodable book that matches this skill level. Aim for 95%+ accuracy. End with a quick comprehension question: &quot;What was that about? What was your favourite part?&quot;
      </div>
    </div>
  );
}
