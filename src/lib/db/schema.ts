import { pgTable, serial, text, integer, date, timestamp, real, primaryKey } from "drizzle-orm/pg-core";
// Stage values: "1","2","3","4","4+","5","6","7.1","7.2","7.3","7.4"

export const children = pgTable("children", {
  id: text("id").primaryKey(), // 8-char random code — also serves as share code
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const childSkillProgress = pgTable(
  "child_skill_progress",
  {
    childId: text("child_id").notNull().references(() => children.id),
    skillId: integer("skill_id").notNull(),
    status: text("status").notNull().default("not_started"),
    masteredDate: date("mastered_date"),
  },
  (t) => [primaryKey({ columns: [t.childId, t.skillId] })]
);

export const phonicsSkills = pgTable("phonics_skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  sequenceOrder: integer("sequence_order").notNull(),
  status: text("status").notNull().default("not_started"), // not_started | in_progress | mastered
  masteredDate: date("mastered_date"),
  examples: text("examples"), // comma-separated example words
  stage: text("stage").notNull(), // "1","2","3","4","4+","5","6","7.1","7.2","7.3","7.4"
  heartWords: text("heart_words"), // comma-separated high-frequency heart words for this stage
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
  stageMin: text("stage_min").default("1"),
  stageMax: text("stage_max").default("7.4"),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  childId: text("child_id").references(() => children.id),
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
  childId: text("child_id").references(() => children.id),
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
  childId: text("child_id").references(() => children.id),
  date: date("date").notNull(),
  type: text("type").notNull(), // wcpm | sounds_known | words_decoded | sight_words
  value: real("value").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
