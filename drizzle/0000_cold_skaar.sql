CREATE TABLE "assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"child_id" text,
	"date" date NOT NULL,
	"type" text NOT NULL,
	"value" real NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"child_id" text,
	"title" text NOT NULL,
	"series" text,
	"phonics_level" integer NOT NULL,
	"date_read" date NOT NULL,
	"accuracy_pct" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "child_skill_progress" (
	"child_id" text NOT NULL,
	"skill_id" integer NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"mastered_date" date,
	CONSTRAINT "child_skill_progress_child_id_skill_id_pk" PRIMARY KEY("child_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "children" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "phonics_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"sequence_order" integer NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"mastered_date" date,
	"examples" text,
	"stage" text NOT NULL,
	"heart_words" text,
	"warmup" text,
	"introduction" text,
	"word_list" text,
	"dictation_words" text,
	"tips_for_parents" text
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"is_free" integer DEFAULT 1 NOT NULL,
	"stage_min" text DEFAULT '1',
	"stage_max" text DEFAULT '7.4'
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"child_id" text,
	"date" date NOT NULL,
	"duration_minutes" integer,
	"phonics_skill_id" integer,
	"activities" text,
	"rating" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_skill_progress" ADD CONSTRAINT "child_skill_progress_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_phonics_skill_id_phonics_skills_id_fk" FOREIGN KEY ("phonics_skill_id") REFERENCES "public"."phonics_skills"("id") ON DELETE no action ON UPDATE no action;