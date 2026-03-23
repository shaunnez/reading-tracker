"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateSkillStatus } from "@/lib/actions";

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

const STATUS_CONFIG: Record<string, {
  cardClass: string;
  chipClass: string;
  label: string;
  icon: string;
  nextLabel: string;
}> = {
  not_started: {
    cardClass: "bg-white border-gray-200",
    chipClass: "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300",
    label: "Not started",
    icon: "⬜",
    nextLabel: "Mark in progress",
  },
  in_progress: {
    cardClass: "bg-yellow-50 border-yellow-300",
    chipClass: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 active:bg-yellow-300",
    label: "In progress",
    icon: "🟨",
    nextLabel: "Mark mastered",
  },
  mastered: {
    cardClass: "bg-green-50 border-green-300",
    chipClass: "bg-green-100 text-green-800 hover:bg-green-200 active:bg-green-300",
    label: "Mastered ✓",
    icon: "🟩",
    nextLabel: "Reset to not started",
  },
};

export default function PhonicsMap({ skills: initialSkills, childId }: { skills: Skill[]; childId: string }) {
  const [skills, setSkills] = useState(initialSkills);
  const [isPending, startTransition] = useTransition();

  const handleStatusToggle = (e: React.MouseEvent, skill: Skill) => {
    e.preventDefault();
    e.stopPropagation();
    const nextStatus = STATUS_CYCLE[skill.status];
    setSkills((prev) =>
      prev.map((s) => (s.id === skill.id ? { ...s, status: nextStatus } : s))
    );
    startTransition(() => updateSkillStatus(skill.id, nextStatus, childId));
  };

  const phases = [1, 2, 3, 4];
  const mastered = skills.filter((s) => s.status === "mastered").length;
  const total = skills.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
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
                const cfg = STATUS_CONFIG[skill.status];
                return (
                  <Link
                    key={skill.id}
                    href={`/phonics/${skill.id}`}
                    className={`block rounded-lg border p-3 transition-all hover:shadow-sm ${cfg.cardClass}`}
                  >
                    {/* Skill name + examples */}
                    <p className="text-sm font-medium leading-tight mb-1">
                      <span className="text-gray-400 mr-1">#{skill.sequenceOrder}</span>
                      {skill.name}
                    </p>
                    {skill.examples && (
                      <p className="text-xs text-gray-400 font-mono truncate mb-3">
                        {skill.examples}
                      </p>
                    )}

                    {/* Bottom row: status toggle + start lesson */}
                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <button
                        onClick={(e) => handleStatusToggle(e, skill)}
                        title={cfg.nextLabel}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${cfg.chipClass}`}
                      >
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </button>

                      <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 shrink-0">
                        Start lesson →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
