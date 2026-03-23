"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateSkillStatus } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";

const PHASE_INFO = [
  null,
  { label: "Phase 1: Foundation", months: "Months 1–3", color: "bg-blue-50 border-blue-200" },
  { label: "Phase 2: Consolidation", months: "Months 4–6", color: "bg-purple-50 border-purple-200" },
  { label: "Phase 3: Expansion", months: "Months 7–9", color: "bg-emerald-50 border-emerald-200" },
  { label: "Phase 4: Independence", months: "Months 10–12", color: "bg-amber-50 border-amber-200" },
];

type Skill = {
  id: number;
  name: string;
  category: string;
  sequenceOrder: number;
  status: string;
  examples: string | null;
  phase: number;
  masteredDate: string | null;
};

const STATUS_CYCLE: Record<string, "not_started" | "in_progress" | "mastered"> = {
  not_started: "in_progress",
  in_progress: "mastered",
  mastered: "not_started",
};

const STATUS_STYLES: Record<string, string> = {
  not_started: "bg-white border-gray-200 text-gray-600 hover:border-gray-300",
  in_progress: "bg-yellow-50 border-yellow-300 text-yellow-900",
  mastered: "bg-green-50 border-green-300 text-green-900",
};

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  not_started: { label: "Not started", variant: "outline" },
  in_progress: { label: "In progress", variant: "default" },
  mastered: { label: "Mastered ✓", variant: "secondary" },
};

export default function PhonicsMap({ skills: initialSkills }: { skills: Skill[] }) {
  const [skills, setSkills] = useState(initialSkills);
  const [isPending, startTransition] = useTransition();

  const handleClick = (skill: Skill) => {
    const nextStatus = STATUS_CYCLE[skill.status];
    setSkills((prev) =>
      prev.map((s) => (s.id === skill.id ? { ...s, status: nextStatus } : s))
    );
    startTransition(() => updateSkillStatus(skill.id, nextStatus));
  };

  const phases = [1, 2, 3, 4];

  const mastered = skills.filter((s) => s.status === "mastered").length;
  const total = skills.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>🟩 Mastered ({mastered})</span>
        <span>🟨 In progress</span>
        <span>⬜ Not started ({total - mastered})</span>
        {isPending && <span className="text-indigo-500">Saving…</span>}
      </div>

      {phases.map((phase) => {
        const phaseSkills = skills.filter((s) => s.phase === phase);
        const info = PHASE_INFO[phase]!;
        const phaseMastered = phaseSkills.filter((s) => s.status === "mastered").length;

        return (
          <div key={phase} className={`rounded-xl border p-4 ${info.color}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-gray-800">{info.label}</h2>
                <p className="text-xs text-gray-500">{info.months}</p>
              </div>
              <span className="text-sm text-gray-600">
                {phaseMastered}/{phaseSkills.length} mastered
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {phaseSkills.map((skill) => {
                const badge = STATUS_BADGES[skill.status];
                return (
                  <button
                    key={skill.id}
                    onClick={() => handleClick(skill)}
                    className={`text-left rounded-lg border p-3 transition-all ${STATUS_STYLES[skill.status]}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight">
                          <span className="text-gray-400 mr-1">#{skill.sequenceOrder}</span>
                          {skill.name}
                        </p>
                        {skill.examples && (
                          <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                            {skill.examples}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge variant={badge.variant} className="text-xs">
                          {badge.label}
                        </Badge>
                        <Link
                          href={`/phonics/${skill.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-indigo-600 hover:underline whitespace-nowrap"
                        >
                          Start lesson →
                        </Link>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
