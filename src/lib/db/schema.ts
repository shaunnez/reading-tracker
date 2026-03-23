import { pgTable, serial, text, integer, date, timestamp, real } from "drizzle-orm/pg-core";

export const phonicsSkills = pgTable("phonics_skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  sequenceOrder: integer("sequence_order").notNull(),
  status: text("status").notNull().default("not_started"), // not_started | in_progress | mastered
  masteredDate: date("mastered_date"),
  examples: text("examples"), // comma-separated example words
  phase: integer("phase").notNull(), // 1-4 maps to months 1-3, 4-6, 7-9, 10-12
  // Lesson content
  warmup: text("warmup"),           // oral phonemic awareness activity
  introduction: text("introduction"), // how to introduce the concept (script)
  wordList: text("word_list"),       // comma-separated practice words
  dictationWords: text("dictation_words"), // comma-separated dictation words
  tipsForParents: text("tips_for_parents"), // common mistakes / what to watch for
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  type: text("type").notNull(), // book | website | app | printable
  isFree: integer("is_free").notNull().default(1), // 1 = free
  phonicsLevelMin: integer("phonics_level_min").notNull().default(1),
  phonicsLevelMax: integer("phonics_level_max").notNull().default(48),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  durationMinutes: integer("duration_minutes"),
  phonicsSkillId: integer("phonics_skill_id").references(() => phonicsSkills.id),
  activities: text("activities"), // comma-separated: blending,dictation,decodable_reading,read_aloud
  rating: integer("rating"), // 1-5
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  series: text("series"),
  phonicsLevel: integer("phonics_level").notNull(), // maps to sequence_order range
  dateRead: date("date_read").notNull(),
  accuracyPct: integer("accuracy_pct"), // rough estimate 0-100
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  type: text("type").notNull(), // wcpm | sounds_known | words_decoded | sight_words
  value: real("value").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
