"use server";

import { getDb } from "./db";
import { phonicsSkills, sessions, books, assessments, resources } from "./db/schema";
import { eq, desc, asc, and, lte, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ---- Phonics Skills ----

export async function getPhonicsSkills() {
  return getDb().select().from(phonicsSkills).orderBy(asc(phonicsSkills.sequenceOrder));
}

export async function updateSkillStatus(
  id: number,
  status: "not_started" | "in_progress" | "mastered"
) {
  await getDb()
    .update(phonicsSkills)
    .set({
      status,
      masteredDate: status === "mastered" ? new Date().toISOString().split("T")[0] : null,
    })
    .where(eq(phonicsSkills.id, id));
  revalidatePath("/phonics");
  revalidatePath("/");
}

// ---- Sessions ----

export async function getSessions(limit = 50) {
  return getDb()
    .select()
    .from(sessions)
    .orderBy(desc(sessions.date))
    .limit(limit);
}

export async function createSession(data: {
  date: string;
  durationMinutes?: number;
  phonicsSkillId?: number;
  activities?: string;
  rating?: number;
  notes?: string;
}) {
  await getDb().insert(sessions).values(data);
  revalidatePath("/");
  revalidatePath("/sessions");
}

// ---- Books ----

export async function getBooks() {
  return getDb().select().from(books).orderBy(desc(books.dateRead));
}

export async function createBook(data: {
  title: string;
  series?: string;
  phonicsLevel: number;
  dateRead: string;
  accuracyPct?: number;
  notes?: string;
}) {
  await getDb().insert(books).values(data);
  revalidatePath("/books");
}

// ---- Assessments ----

export async function getAssessments() {
  return getDb().select().from(assessments).orderBy(asc(assessments.date));
}

export async function createAssessment(data: {
  date: string;
  type: string;
  value: number;
  notes?: string;
}) {
  await getDb().insert(assessments).values(data);
  revalidatePath("/progress");
  revalidatePath("/");
}

// ---- Single skill detail ----

export async function getSkillById(id: number) {
  const rows = await getDb()
    .select()
    .from(phonicsSkills)
    .where(eq(phonicsSkills.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// ---- Resources for a skill level ----

export async function getResources(levelMin: number, levelMax: number) {
  return getDb()
    .select()
    .from(resources)
    .where(
      and(
        lte(resources.phonicsLevelMin, levelMax),
        gte(resources.phonicsLevelMax, levelMin)
      )
    )
    .orderBy(asc(resources.isFree), asc(resources.type));
}

// ---- Dashboard stats ----

export async function getDashboardStats() {
  const [allSkills, recentSessions, allAssessments] = await Promise.all([
    getPhonicsSkills(),
    getSessions(30),
    getAssessments(),
  ]);

  const mastered = allSkills.filter((s) => s.status === "mastered").length;
  const inProgress = allSkills.filter((s) => s.status === "in_progress").length;
  const total = allSkills.length;

  // Current phase based on highest mastered skill
  const highestMastered = allSkills
    .filter((s) => s.status === "mastered")
    .sort((a, b) => b.sequenceOrder - a.sequenceOrder)[0];
  const currentPhase = highestMastered ? highestMastered.phase : 1;

  // Streak — count consecutive days with sessions ending today/yesterday
  const today = new Date();
  let streak = 0;
  const sessionDates = new Set(recentSessions.map((s) => s.date));
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (sessionDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Latest WPM assessment
  const wcpmAssessments = allAssessments.filter((a) => a.type === "wcpm");
  const latestWcpm = wcpmAssessments[wcpmAssessments.length - 1]?.value ?? null;

  // Current focus skill
  const focusSkill =
    allSkills.find((s) => s.status === "in_progress") ??
    allSkills.find((s) => s.status === "not_started") ??
    null;

  return {
    mastered,
    inProgress,
    total,
    currentPhase,
    streak,
    latestWcpm,
    focusSkill,
    recentSessions: recentSessions.slice(0, 5),
    wcpmHistory: wcpmAssessments,
  };
}
