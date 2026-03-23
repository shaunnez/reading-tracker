"use server";

import { getDb } from "./db";
import { children, childSkillProgress, phonicsSkills, sessions, books, assessments, resources } from "./db/schema";
import { eq, desc, asc, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// ---- Children ----

function generateShareCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createChild(name: string) {
  const id = generateShareCode();
  await getDb().insert(children).values({ id, name });
  const cookieStore = await cookies();
  cookieStore.set("activeChildId", id, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/");
  return { id, name };
}

export async function joinChild(shareCode: string) {
  const rows = await getDb()
    .select()
    .from(children)
    .where(eq(children.id, shareCode.toLowerCase().trim()))
    .limit(1);
  const child = rows[0] ?? null;
  if (child) {
    const cookieStore = await cookies();
    cookieStore.set("activeChildId", child.id, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    revalidatePath("/");
  }
  return child;
}

export async function setActiveChild(childId: string) {
  const cookieStore = await cookies();
  cookieStore.set("activeChildId", childId, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/");
}

export async function clearChildData(
  childId: string,
  options: {
    progress: boolean;
    sessions: boolean;
    assessments: boolean;
    books: boolean;
  }
) {
  const db = getDb();
  if (options.progress) {
    await db.delete(childSkillProgress).where(eq(childSkillProgress.childId, childId));
  }
  if (options.sessions) {
    await db.delete(sessions).where(eq(sessions.childId, childId));
  }
  if (options.assessments) {
    await db.delete(assessments).where(eq(assessments.childId, childId));
  }
  if (options.books) {
    await db.delete(books).where(eq(books.childId, childId));
  }
  revalidatePath("/", "layout");
  revalidatePath("/phonics", "layout");
  revalidatePath("/assessments");
  revalidatePath("/sessions");
  revalidatePath("/books");
}

export async function deleteAssessment(id: number, childId: string) {
  await getDb()
    .delete(assessments)
    .where(and(eq(assessments.id, id), eq(assessments.childId, childId)));
  revalidatePath("/assessments");
  revalidatePath("/");
}

export async function getChildrenByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return getDb()
    .select()
    .from(children)
    .where(sql`${children.id} = ANY(${ids})`);
}

// ---- Phonics Skills ----

export async function getPhonicsSkills(childId: string) {
  const db = getDb();
  const skills = await db
    .select()
    .from(phonicsSkills)
    .orderBy(asc(phonicsSkills.sequenceOrder));

  const progress = await db
    .select()
    .from(childSkillProgress)
    .where(eq(childSkillProgress.childId, childId));

  const progressMap = new Map(progress.map((p) => [p.skillId, p]));

  return skills.map((skill) => {
    const p = progressMap.get(skill.id);
    return {
      ...skill,
      status: p?.status ?? "not_started",
      masteredDate: p?.masteredDate ?? null,
    };
  });
}

export async function updateSkillStatus(
  id: number,
  status: "not_started" | "in_progress" | "mastered",
  childId: string
) {
  const masteredDate = status === "mastered" ? new Date().toISOString().split("T")[0] : null;
  await getDb()
    .insert(childSkillProgress)
    .values({ childId, skillId: id, status, masteredDate })
    .onConflictDoUpdate({
      target: [childSkillProgress.childId, childSkillProgress.skillId],
      set: { status, masteredDate },
    });
  revalidatePath("/phonics");
  revalidatePath("/");
}

// ---- Sessions ----

export async function getSessions(childId: string, limit = 50) {
  return getDb()
    .select()
    .from(sessions)
    .where(eq(sessions.childId, childId))
    .orderBy(desc(sessions.date))
    .limit(limit);
}

export async function createSession(data: {
  childId: string;
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

export async function getBooks(childId: string) {
  return getDb()
    .select()
    .from(books)
    .where(eq(books.childId, childId))
    .orderBy(desc(books.dateRead));
}

export async function createBook(data: {
  childId: string;
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

export async function getAssessments(childId: string) {
  return getDb()
    .select()
    .from(assessments)
    .where(eq(assessments.childId, childId))
    .orderBy(asc(assessments.date));
}

export async function createAssessment(data: {
  childId: string;
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

export async function getSkillById(id: number, childId: string) {
  const rows = await getDb()
    .select()
    .from(phonicsSkills)
    .where(eq(phonicsSkills.id, id))
    .limit(1);
  const skill = rows[0] ?? null;
  if (!skill) return null;

  const progress = await getDb()
    .select()
    .from(childSkillProgress)
    .where(
      and(
        eq(childSkillProgress.childId, childId),
        eq(childSkillProgress.skillId, id)
      )
    )
    .limit(1);

  const p = progress[0];
  return {
    ...skill,
    status: p?.status ?? "not_started",
    masteredDate: p?.masteredDate ?? null,
  };
}

// ---- Resources for a skill stage ----

const STAGE_ORDER = ["1","2","3","4","4+","5","6","7.1","7.2","7.3","7.4"];

export async function getResources(stage: string) {
  const all = await getDb()
    .select()
    .from(resources)
    .orderBy(asc(resources.isFree), asc(resources.type));
  const stageIdx = STAGE_ORDER.indexOf(stage);
  return all.filter((r) => {
    const minIdx = STAGE_ORDER.indexOf(r.stageMin ?? "1");
    const maxIdx = STAGE_ORDER.indexOf(r.stageMax ?? "7.4");
    return stageIdx >= minIdx && stageIdx <= maxIdx;
  });
}

// ---- Placement test result ----

export async function applyPlacementResult(startingSkillSeq: number, childId: string) {
  const db = getDb();
  const today = new Date().toISOString().split("T")[0];

  const allSkills = await db
    .select({ id: phonicsSkills.id, sequenceOrder: phonicsSkills.sequenceOrder })
    .from(phonicsSkills)
    .orderBy(asc(phonicsSkills.sequenceOrder));

  const upserts = allSkills.map((skill) => {
    let status: string;
    let masteredDate: string | null = null;
    if (skill.sequenceOrder < startingSkillSeq) {
      status = "mastered";
      masteredDate = today;
    } else if (skill.sequenceOrder === startingSkillSeq) {
      status = "in_progress";
    } else {
      status = "not_started";
    }
    return { childId, skillId: skill.id, status, masteredDate };
  });

  for (const row of upserts) {
    await db
      .insert(childSkillProgress)
      .values(row)
      .onConflictDoUpdate({
        target: [childSkillProgress.childId, childSkillProgress.skillId],
        set: { status: row.status, masteredDate: row.masteredDate },
      });
  }

  revalidatePath("/phonics");
  revalidatePath("/");
}

// ---- Dashboard stats ----

export async function getDashboardStats(childId: string) {
  const [allSkills, recentSessions, allAssessments] = await Promise.all([
    getPhonicsSkills(childId),
    getSessions(childId, 30),
    getAssessments(childId),
  ]);

  const mastered = allSkills.filter((s) => s.status === "mastered").length;
  const inProgress = allSkills.filter((s) => s.status === "in_progress").length;
  const total = allSkills.length;

  const highestMastered = allSkills
    .filter((s) => s.status === "mastered")
    .sort((a, b) => b.sequenceOrder - a.sequenceOrder)[0];
  const currentStage = highestMastered ? highestMastered.stage : "1";

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

  const wcpmAssessments = allAssessments.filter((a) => a.type === "wcpm");
  const latestWcpm = wcpmAssessments[wcpmAssessments.length - 1]?.value ?? null;

  const focusSkill =
    allSkills.find((s) => s.status === "in_progress") ??
    allSkills.find((s) => s.status === "not_started") ??
    null;

  return {
    mastered,
    inProgress,
    total,
    currentStage,
    streak,
    latestWcpm,
    focusSkill,
    recentSessions: recentSessions.slice(0, 5),
    wcpmHistory: wcpmAssessments,
  };
}
