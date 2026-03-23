https://cdn.shopify.com/s/files/1/0482/2030/7613/files/Teaching_sequence_JUL25.pdf?v=1753854999

Re-skin to LLLL stages (recommended)
Restructure the 48 skills to follow the LLLL 7-stage sequence. This means:
	1.	Schema change — replace phase (1-4) with stage (text like “1”, “2”, “3”, “4”, “4+”, “5”, “6”, “7.1”, “7.2”, “7.3”, “7.4”) and add a heartWords field
	2.	Re-order skills — The sequence becomes:
	∙	Skills 1-8: Stage 1 (m, s, f, a, p, t, c, i — one per skill)
	∙	Skills 9-16: Stage 2 (b, h, n, o, d, g, l, v)
	∙	Skills 17-21: Stage 3 (y, r, e, qu, z)
	∙	Skills 22-26: Stage 4 (j, u, k, x, w)
	∙	Skill 27: Stage 4+ (ll, ss, ff, zz, plurals)
	∙	Skills 28-33: Stage 5 (consonant blends + ck)
	∙	Skills 34-40: Stage 6 (sh, ch, ng, th, ph, wh, tch)
	∙	Skills 41-60+: Stage 7 units (vowel teams, r-controlled, split digraphs, morphology)
	3.	New seed data — Rewrite word lists, warmups, introductions to match LLLL methodology
	4.	Update PHONEME_VISUAL — New emoji/color mappings for the reordered skills
	5.	Update phonics-map.tsx — Group by LLLL stage instead of phase
	6.	Pip and Tim book integration — Add LLLL decodable books to the resources table, mapped to stages

A? I can plan it as a set of parallel tasks:
	1.	Schema migration (add stage, heartWords fields)
	2.	New seed data following the LLLL sequence
	3.	Update PHONEME_VISUAL and phonics-map grouping
	4.	Add Pip and Tim books to resources
Sources:
	∙	The Seven Stages of LLLL
	∙	LLLL Planning Lessons
	∙	Pip and Tim Decodable Readers
	∙	SPELD NSW Decodable Book Selector for LLLL
	∙	Choosing a Phonics Sequence – Spelfabet

Need to also consider the books presented, the phonics skill list shown in log session, and verbage across the site. We will clean the database and start again.
Come up with a plan, we will want to use parallel workers to implement it.