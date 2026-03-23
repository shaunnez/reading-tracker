"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateSkillStatus } from "@/lib/actions";

const STAGE_INFO = [
  { stage: "1",   label: "Stage 1",        description: "m · s · f · a · p · t · c · i",      color: "bg-amber-50 border-amber-200",    badge: "bg-amber-100 text-amber-800" },
  { stage: "2",   label: "Stage 2",        description: "b · h · n · o · d · g · l · v",      color: "bg-sky-50 border-sky-200",        badge: "bg-sky-100 text-sky-800" },
  { stage: "3",   label: "Stage 3",        description: "y · r · e · qu · z",                 color: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-800" },
  { stage: "4",   label: "Stage 4",        description: "j · u · k · x · w",                 color: "bg-violet-50 border-violet-200",  badge: "bg-violet-100 text-violet-800" },
  { stage: "4+",  label: "Stage 4+",       description: "Double letters · Plurals",           color: "bg-rose-50 border-rose-200",      badge: "bg-rose-100 text-rose-800" },
  { stage: "5",   label: "Stage 5",        description: "Consonant blends · ck",              color: "bg-orange-50 border-orange-200",  badge: "bg-orange-100 text-orange-800" },
  { stage: "6",   label: "Stage 6",        description: "sh · ch · tch · th · ng · ph · wh",  color: "bg-teal-50 border-teal-200",      badge: "bg-teal-100 text-teal-800" },
  { stage: "7.1", label: "Stage 7 Unit 1", description: "Long vowel teams · -ing",            color: "bg-purple-50 border-purple-200",  badge: "bg-purple-100 text-purple-800" },
  { stage: "7.2", label: "Stage 7 Unit 2", description: "R-controlled vowels",                color: "bg-indigo-50 border-indigo-200",  badge: "bg-indigo-100 text-indigo-800" },
  { stage: "7.3", label: "Stage 7 Unit 3", description: "Diphthongs · oo sounds",             color: "bg-fuchsia-50 border-fuchsia-200", badge: "bg-fuchsia-100 text-fuchsia-800" },
  { stage: "7.4", label: "Stage 7 Unit 4", description: "Split digraphs · Silent letters",    color: "bg-cyan-50 border-cyan-200",      badge: "bg-cyan-100 text-cyan-800" },
];

type Skill = {
  id: number;
  name: string;
  category: string;
  sequenceOrder: number;
  status: string;
  examples: string | null;
  stage: string;
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

      {STAGE_INFO.map((stageInfo) => {
        const stageSkills = skills.filter((s) => s.stage === stageInfo.stage);
        if (stageSkills.length === 0) return null;
        const stageMastered = stageSkills.filter((s) => s.status === "mastered").length;

        return (
          <div key={stageInfo.stage} className={`rounded-xl border p-4 ${stageInfo.color}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-gray-800">{stageInfo.label}</h2>
                <p className="text-xs text-gray-500">{stageInfo.description}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageInfo.badge}`}>
                {stageMastered}/{stageSkills.length} mastered
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {stageSkills.map((skill) => {
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
