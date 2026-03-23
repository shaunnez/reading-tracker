# Lesson Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the app so each phonics skill has a full teaching script (warmup, introduction, word list, dictation, parent tips) and a lesson detail page, so the app tells the parent exactly what to do in each session rather than just tracking progress.

**Architecture:** Rewrite `seed.ts` to UPDATE the 48 existing phonics_skill rows with lesson content (using Drizzle `update().where()` per row, since no unique constraint exists), seed a new `resources` table with free book/website links, add two server actions, build a dynamic `/phonics/[id]` lesson page, and add a "Start Lesson" button on the phonics map cards.

**Tech Stack:** Next.js 16.2.1 App Router, Drizzle ORM + Neon Postgres, Tailwind CSS, shadcn/ui, TypeScript

---

## File Map

| File | Change |
|------|--------|
| `src/lib/db/seed.ts` | Full rewrite — UPDATE all 48 skills with lesson content, INSERT resources |
| `src/lib/actions.ts` | Add `getSkillById` and `getResources` server actions |
| `src/app/phonics/phonics-map.tsx` | Add "Start Lesson" link on each skill card |
| `src/app/phonics/[id]/page.tsx` | Create — lesson detail server page |

---

## Task 1: Rewrite seed.ts with full lesson content

**Files:**
- Modify: `src/lib/db/seed.ts`

The existing 48 rows were inserted with `onConflictDoNothing()` and have `null` in all lesson columns. Since there is no unique constraint on `sequenceOrder` (only a PK on `id`), we cannot use `onConflictDoUpdate()` reliably. Instead, run `UPDATE ... WHERE sequence_order = N` for each skill, then `INSERT` resources.

- [ ] **Step 1: Replace seed.ts with the full rewrite below**

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

// ─────────────────────────────────────────────────────────────
// LESSON CONTENT — one entry per skill (sequenceOrder 1–48)
// Each entry matches a row already in the DB by sequenceOrder.
// ─────────────────────────────────────────────────────────────

const LESSON_CONTENT: Record<number, {
  warmup: string;
  introduction: string;
  wordList: string;
  dictationWords: string;
  tipsForParents: string;
}> = {
  // ── Phase 1: CVC Foundation ───────────────────────────────
  1: {
    warmup: "Oral blending game — say the sounds slowly and ask her to push them together: /k/ /a/ /t/ → 'cat'. Do 5 rounds: /m/ /a/ /n/, /h/ /a/ /t/, /b/ /a/ /g/, /r/ /a/ /n/, /t/ /a/ /p/.",
    introduction: "Say: 'Today we're learning the short 'a' sound — it says /a/ like the middle of 'cat'. Watch me: c–a–t. I say each sound then push them together: /k/ /a/ /t/ → cat. Your turn — point to each letter with your finger as you say its sound, then blend.' Model 2 words before she tries alone.",
    wordList: "cat,bat,hat,mat,sat,can,ran,man,fan,pan,cap,map,tap,rap,bag,tag,nag,rag,had,bad",
    dictationWords: "cat,man,hat,tap,bag",
    tipsForParents: "If she tries to guess from the picture, cover it and point back to the letters. Encourage slow sounding-out followed by a smooth blend — don't let her say 'c…a…t' without merging them into 'cat'.",
  },
  2: {
    warmup: "Phoneme isolation — 'Tell me the middle sound in: sit, pin, big, him, zip.' Give her time after each. Clap once for correct answers.",
    introduction: "Say: 'Short 'i' says /i/ — like when you itch. Say /i/. Let's decode: s–i–t → /s/ /i/ /t/ → sit. Remember to point to each letter as you say its sound.' Write 'sit', 'pin', 'big' on paper and have her decode each before reading from the word list.",
    wordList: "sit,pin,big,him,zip,bit,fit,hit,kit,lit,pig,wig,dig,fig,rig,bid,did,hid,kid,lid",
    dictationWords: "sit,pin,big,hit,lid",
    tipsForParents: "Short /i/ is often confused with short /e/ (sit vs set). If she reads 'set' for 'sit', say 'Good try — listen to the vowel again: /i/. What word?' Don't correct harshly.",
  },
  3: {
    warmup: "Odd one out — say 3 words: 'dog, pot, sit' — which one has a different middle sound? Repeat with: hot/got/big, log/cup/fog.",
    introduction: "Say: 'Short 'o' says /o/ — like when the doctor says 'open wide and say ahh'. Say /o/. Let's decode: d–o–g → /d/ /o/ /g/ → dog.' Model 2-3 words, then have her decode from the list with her finger.",
    wordList: "dog,hot,pot,got,log,cob,cod,fog,hog,job,hop,mop,pop,top,cop,dot,lot,rot,not,sob",
    dictationWords: "dog,hot,pot,log,hop",
    tipsForParents: "The letter 'o' looks round like an open mouth — remind her of this visual cue if she forgets the sound. Don't let her read too fast; accuracy first, then speed.",
  },
  4: {
    warmup: "Rhyme chain — start with 'bug', ask her to say a rhyming word. Keep going until she can't: bug → rug → mug → jug → tug → hug.",
    introduction: "Say: 'Short 'u' says /u/ — like a short surprised 'uh'. Say /u/. Let's decode: b–u–g → /b/ /u/ /g/ → bug.' Have her point to and say each sound before blending. Do 3 modeled words before she works independently.",
    wordList: "bug,cup,run,mud,fun,bud,dug,hug,jug,mug,rug,tug,bus,gum,sum,rum,cut,gut,hut,nut",
    dictationWords: "bug,cup,run,mud,hut",
    tipsForParents: "Short /u/ is one of the hardest vowels — 'uh' is a very neutral sound. Accept mild variations but redirect to the correct sound. If she writes 'o' for 'u', say 'Think about the short u sound — does 'bug' have an /o/ in the middle?'",
  },
  5: {
    warmup: "Sound segmenting — 'I say a word, you say each sound separately: bed → /b/ /e/ /d/.' Do: hen, pet, red, web, leg. Use fingers to count the sounds.",
    introduction: "Say: 'Short 'e' says /e/ — like when you're confused and say 'eh?' Say /e/. Let's decode: b–e–d → /b/ /e/ /d/ → bed.' Short /e/ is tricky — model several words and contrast with short /a/ (hat vs het is not a word, so use pen vs pan).",
    wordList: "bed,hen,pet,red,web,beg,leg,peg,beg,den,men,ten,yen,get,jet,met,net,set,wet,yet",
    dictationWords: "bed,hen,pet,red,leg",
    tipsForParents: "Short /e/ is frequently confused with short /i/ — especially 'pen' vs 'pin'. If this happens, isolate the vowel: 'Say the middle sound in pen — is it /e/ or /i/?' Exaggerate the sounds to help her hear the difference.",
  },
  6: {
    warmup: "Mixed vowel sort — say words one at a time and ask her to hold up 1 finger for /a/, 2 for /i/, 3 for /o/, 4 for /u/, 5 for /e/: cat, sit, dog, bug, bed, hat, pin, hot, cup, wet.",
    introduction: "Say: 'You know all 5 short vowels now! When we see a CVC word (consonant-vowel-consonant), we always try the short vowel sound first. Let's practice mixed ones.' Pick one word from each vowel group and decode together before the word list.",
    wordList: "cat,sit,dog,bug,bed,hat,pin,hot,cup,wet,man,big,fox,run,ten,tap,lip,cot,fun,net",
    dictationWords: "hat,pin,hot,cup,net",
    tipsForParents: "The goal here is automatic vowel identification — she should decode fluently without you prompting the vowel. If she stalls, ask 'What sound does that vowel make?' rather than telling her.",
  },
  7: {
    warmup: "Sentence listening — 'I'll say a sentence. How many words?' Examples: 'The cat sat.' (3), 'A big dog ran.' (4), 'I can see a red hat.' (6). Count on fingers.",
    introduction: "Say: 'Now we're going to read whole sentences! Remember to decode each word left to right, and leave a tiny pause between words. Point to each word as you read it.' Use printed decodable sentences. After each sentence, ask: 'What was that about?'",
    wordList: "The cat sat on the mat. A big dog ran. The red hen sat. I can see a fat cat. The sun is hot. A man had a hat. She got a hug. The bug is on a log.",
    dictationWords: "The cat sat.,A big dog ran.",
    tipsForParents: "Don't rush sentences — if she decodes individual words correctly but loses meaning, say 'Let's read it again — what happened in that sentence?' Comprehension check after every 2-3 sentences.",
  },
  8: {
    warmup: "Quick fire — hold up each word on a card (or say it): the, a, is, it, in, on, at, can, I, we. She reads it — 3 seconds max per word. Any she don't know, put in a 'review pile'.",
    introduction: "Say: 'Some words don't follow the rules perfectly — we call these high-frequency words. We learn to read them by sight. Here are 10 important ones. Let's look at each one and notice what's tricky: 'the' — the 'th' and the 'e' says /uh/ not /e/; 'said' sounds like /sed/ not /sa-id/.' Teach 2-3 per session.",
    wordList: "the,a,is,it,in,on,at,can,I,we,me,be,he,she,no,go,so,do,to,my",
    dictationWords: "the,is,it,in,can",
    tipsForParents: "Do NOT ask her to sound out these words in a standard phonics way — explain the irregular part. 'The' is almost always the trickiest. Post these on the fridge and point to them during the day.",
  },
  9: {
    warmup: "Flash the set 1 words quickly (from skill 8) — quick review before adding set 2. Any that are now automatic, celebrate!",
    introduction: "Say: 'Set 2 has some really important words. Let's look at 'said' — it looks like it should say /sa-id/ but it actually says /sed/. And 'was' — looks like it should say /waz/ but says /wuz/. The tricky parts are the vowels.' Highlight the irregular part in each word.",
    wordList: "said,was,are,he,she,they,you,do,to,into,have,from,with,there,here,come,some,were,your,what",
    dictationWords: "said,was,are,they,you",
    tipsForParents: "If she reads 'were' as 'wear' or 'there' as 'three', that's a natural phonics attempt — praise the effort and show her the correct way. Regular 5-minute review of all known sight words keeps them fresh.",
  },

  // ── Phase 2: Digraphs & Blends ────────────────────────────
  10: {
    warmup: "Sound stretching — slowly say 'ship' and ask her to count the sounds: /sh/ /i/ /p/ = 3. Repeat with: fish, dish, wish, shop. Two letters, one sound!",
    introduction: "Say: 'When we see 's' and 'h' together, they make ONE new sound: /sh/. Not /s/ and /h/ separately — just /sh/. Let me show you: sh-i-p → /sh/ /i/ /p/ → ship. Your turn.' Write 'SH' large and practice saying it before decoding words.",
    wordList: "ship,shop,fish,wish,dish,shed,shelf,shell,shin,shim,rush,gush,bush,push,cash,dash,lash,mash,rash,wash",
    dictationWords: "ship,fish,dish,shell,rush",
    tipsForParents: "Watch for her sounding out 's' and 'h' separately — gently remind her: 'When you see sh together, they make just one sound: /sh/.' This applies to all digraphs.",
  },
  11: {
    warmup: "Digraph matching game — say: 'sh or ch? Ship... chip... shop... chop... fish... chin.' She says which digraph she hears.",
    introduction: "Say: 'CH makes the sound /ch/ — like a sneeze or a train: ch-ch-ch! Look: ch-i-p → /ch/ /i/ /p/ → chip.' Compare 'ship' and 'chip' to highlight the difference between sh and ch.",
    wordList: "chip,chop,much,rich,chin,chat,chug,chess,check,chest,bench,bunch,ranch,lunch,pinch,inch,such,touch,each,teach",
    dictationWords: "chip,chop,chin,bench,lunch",
    tipsForParents: "Some kids say /sh/ for /ch/ — if this happens, say 'Feel how your tongue hits the top of your mouth for /ch/'. Physical awareness of mouth position helps.",
  },
  12: {
    warmup: "Voiced vs unvoiced — 'th' has two sounds! Say 'the' and feel your throat vibrate (voiced /ð/). Say 'thin' and notice no vibration (unvoiced /θ/). Practice both.",
    introduction: "Say: 'TH makes two sounds — a soft /th/ as in thin, and a louder buzzy /th/ as in this. Put your tongue lightly between your teeth for both.' Teach voiced (this, that, them) and unvoiced (thin, thank, with) as separate groups.",
    wordList: "this,that,them,with,bath,path,math,than,then,thus,thick,think,third,thud,theft,cloth,moth,both,teeth,smooth",
    dictationWords: "this,that,with,thin,bath",
    tipsForParents: "The voiced /th/ (this, that) is used much more frequently in English. If she struggles, model the tongue placement and have her feel your throat for the vibration on the voiced version.",
  },
  13: {
    warmup: "Question game — ask silly questions using 'wh' words: 'What is your name? When do you eat lunch? Where is your nose? Why is the sky blue?' She listens and identifies the question word.",
    introduction: "Say: 'WH usually makes the /w/ sound — just like the letter w by itself. So when: /w/ /e/ /n/ → when. Let's read some wh- words.' Note: in some dialects 'wh' has a slight breath before the /w/ — this is fine either way.",
    wordList: "when,what,whip,where,which,while,white,whale,wheat,wheel,whether,whisper,why,whom,whose,wham,whack,whet,whiff,whiz",
    dictationWords: "when,what,whip,white,wheel",
    tipsForParents: "WH is one of the simpler digraphs since it just sounds like /w/. Focus on recognizing the pattern rather than the sound. 'Whose' and 'who' are irregular — teach them as sight words.",
  },
  14: {
    warmup: "Endings game — 'I'll say a word, you add /k/ at the end: ba__, du__, ki__, lo__, pa__, ro__.' Then show how writing /k/ after a vowel uses 'ck'.",
    introduction: "Say: 'After a short vowel, we use CK for the /k/ sound — never just C or K alone. Look: d-u-ck → /d/ /u/ /k/ → duck. The C and K together make one /k/ sound.' Compare: 'back' (after short a), 'deck' (after short e), 'kick' (after short i), 'lock', 'duck'.",
    wordList: "back,duck,kick,lock,pack,deck,neck,peck,pick,rock,sock,tick,tuck,rack,hack,jack,lack,muck,suck,buck",
    dictationWords: "back,duck,kick,lock,neck",
    tipsForParents: "The key rule to teach: short vowel + /k/ sound at the end = CK. This is a common spelling pattern she'll use forever. Watch for her writing 'duk' or 'duc' — redirect to 'ck'.",
  },
  15: {
    warmup: "Tongue twisters — 'Blue black bluebirds. Glad glowing globe.' Say each slowly and have her identify the blend at the start of each word.",
    introduction: "Say: 'A blend is two consonants right next to each other — you say BOTH sounds, but fast. Listen: bl-ue → /b/ /l/ oo → blue. Both /b/ AND /l/, not a new sound like digraphs.' Practice: bl, cl, fl, gl, pl, sl — say each blend in isolation before decoding words.",
    wordList: "blue,clap,flag,glad,plan,slip,black,click,flip,glam,play,slam,blend,cliff,flat,glow,plod,slug,blob,clam",
    dictationWords: "clap,flag,plan,slip,glad",
    tipsForParents: "Kids often delete one consonant from a blend — saying 'lap' for 'clap'. If this happens, hold up two fingers and say 'I need to hear TWO sounds before the vowel: /k/ /l/.'",
  },
  16: {
    warmup: "Listen for the blend — say words and she holds up fingers for how many beginning consonants: brag (2), frog (2), trip (2), crisp (2). Then isolate the blend.",
    introduction: "Say: 'R-blends have /r/ as the second sound — the R changes the first consonant. Listen: br-ag → /b/ /r/ /a/ /g/ → brag. Both sounds!' Practice br, cr, dr, fr, gr, tr, pr in isolation. Notice how /r/ slightly changes the vowel sound after it.",
    wordList: "brag,crab,drip,frog,grab,trip,prim,brad,cram,drag,from,grim,trot,prop,brim,crop,drum,fret,grit,prod",
    dictationWords: "crab,drip,frog,trip,grim",
    tipsForParents: "FR- is often mispronounced by young children as 'vr' — say 'frog' carefully and have her feel her top teeth on her lower lip for /f/. Also watch for 'flop' vs 'frog' confusion (l-blend vs r-blend).",
  },
  17: {
    warmup: "Alliteration game — 'Say 3 words that start with /st/: stop, step, stem! Now /sp/: spin, spot, speed! Now /sn/.' Take turns.",
    introduction: "Say: 'S-blends all start with /s/ and then another consonant. Look: st-op → /s/ /t/ /o/ /p/ → stop. The /s/ and /t/ are both there.' Practice each: st, sp, sn, sm, sc, sk, sw before the word list.",
    wordList: "stop,spin,snip,smog,scan,skip,swim,step,spud,snag,smack,scat,skin,swig,stem,spot,snap,smell,scab,skull",
    dictationWords: "stop,spin,snip,skip,swim",
    tipsForParents: "SC and SK make the same blend — /sk/. Point this out. 'Swim' often gets read as 'slim' — both are real blends so it's an understandable error. Have her confirm it makes sense in context.",
  },
  18: {
    warmup: "Ending sound practice — 'I'll say a word, you tell me the last TWO sounds: sand (/n/ /d/), sink (/ŋ/ /k/), best (/s/ /t/).' Then add: lamp, melt, desk.",
    introduction: "Say: 'Final blends come at the END of words — two consonant sounds to finish. Listen: sa-nd → /s/ /a/ /n/ /d/ → sand. Both /n/ and /d/.' Work through each ending pattern: -nd, -nk, -nt, -mp, -st, -lt, -sk separately before the word list.",
    wordList: "sand,sink,tent,lamp,best,melt,desk,band,pink,dent,bump,fist,felt,risk,bend,drink,hint,camp,list,bolt",
    dictationWords: "sand,sink,tent,lamp,best",
    tipsForParents: "Children often drop the final consonant in blends — writing 'san' for 'sand'. Say 'I need to hear two sounds at the end — say it slowly: san...d.' Have her hold the last two fingers out as she says each final sound.",
  },
  19: {
    warmup: "Count the phonemes — 'How many sounds in: stop (4: /s/t/o/p/), frog (4), crisp (5), bland (5)?' Hold up a finger for each sound.",
    introduction: "Say: 'Now we're reading words with blends AND endings — these are more challenging but you have all the skills! Break the word into parts: onset (beginning blend) + rime (vowel + ending). frog = fr + og. step = st + ep.' Model 5 words before independent reading.",
    wordList: "frog,stop,lamp,bend,crisp,skip,gust,clamp,drift,blend,fresh,stomp,trust,clamp,grand,stamp,swept,slept,brisk,cleft",
    dictationWords: "frog,stop,lamp,blend,crisp",
    tipsForParents: "If she's struggling, break the word into syllable-sized chunks verbally: 'Let's do the first part: /fr/ — now add /og/ — fr-og!' The onset+rime split often helps more than pure phoneme-by-phoneme.",
  },
  20: {
    warmup: "Flash review — quickly cycle through all known sight words (sets 1 and 2). Any that are now automatic, make a 'mastered' pile.",
    introduction: "Say: 'Set 3 words are a bit longer and some have patterns we haven't learned yet. Let's look at each one and figure out the tricky bit: 'have' — sounds like /hav/ but has a silent e; 'come' — the 'o' says /u/ not /o/.' Work through 2-3 per session.",
    wordList: "have,from,with,there,come,some,here,were,your,what,know,could,would,should,many,only,other,their,about,which",
    dictationWords: "have,from,with,come,some",
    tipsForParents: "These words appear extremely frequently in books. Any that she doesn't know automatically will slow her reading and frustrate her. 5-minute daily flash card review pays big dividends.",
  },

  // ── Phase 3: Long Vowels ──────────────────────────────────
  21: {
    warmup: "Compare pairs — say slowly: cap vs cape, hat vs hate, man vs mane. 'Which one has the long /a/ sound?' The silent 'e' changes the vowel!",
    introduction: "Say: 'When a word ends in silent 'e', the vowel before it says its name — its LONG sound. c-a-k-e: the 'e' at the end is silent, but it makes the 'a' say /a/ (its name). So: cake, not /kak/.' Write a word on paper, add the 'e' at the end, and watch the vowel change.",
    wordList: "cake,make,late,name,wave,bake,came,dare,face,gate,hate,lake,lane,lame,male,pale,race,safe,tale,wade",
    dictationWords: "cake,make,late,name,wave",
    tipsForParents: "The 'magic e' rule is powerful and widely applicable. When she encounters a new CVCe word, ask 'Is there a magic e at the end?' rather than telling her. Build the habit of scanning the whole word before decoding.",
  },
  22: {
    warmup: "Same game as skill 21 — compare: bit vs bite, pin vs pine, kit vs kite. She identifies which has the long vowel.",
    introduction: "Say: 'Same magic e rule, but now the long vowel is /i/ — it says its name 'eye'. b-i-k-e: magic e makes the i say /i/ (eye). Decode: bike, hide, like, time.' Have her circle the 'e' at the end of each word as a reminder.",
    wordList: "bike,hide,like,time,vine,bite,dine,fine,fire,hire,kite,life,lime,line,mine,nice,nine,rice,ride,side",
    dictationWords: "bike,hide,like,time,kite",
    tipsForParents: "A common error is reading 'vine' as 'vin' — remind her to check for the magic e before she starts decoding. Visual scanning from right to left for the silent e, then decode left to right.",
  },
  23: {
    warmup: "Sort — say words and she says 'short o' or 'long o': hop vs hope, not vs note, cod vs code, rob vs robe, ton vs tone.",
    introduction: "Say: 'Magic e with the letter 'o' gives us long /o/ — it says its name 'oh'. h-o-m-e: the magic e makes the o say /o/.' Contrast minimal pairs: hop/hope, not/note during the lesson.",
    wordList: "home,hope,nose,note,role,bone,code,cone,dome,dose,hole,joke,lone,mode,mole,pole,rope,rose,tone,vote",
    dictationWords: "home,hope,nose,note,rope",
    tipsForParents: "The words 'come', 'some', 'done', 'gone' look like CVCe but have SHORT vowels — they're irregular. Warn her about these exceptions when they come up in reading.",
  },
  24: {
    warmup: "Alliteration with long vowels — 'Cute cubes, mute mules, huge dunes.' She identifies the long /u/ sound in each.",
    introduction: "Say: 'Magic e with 'u' gives long /u/ — it can say 'yoo' (cube) or just 'oo' (rule). Both are correct long u sounds. c-u-b-e → cube.' Both pronunciations are acceptable; if she says /yoo/ or /oo/ for 'rude', both are right.",
    wordList: "cube,cute,mule,tune,use,dune,fume,fuse,huge,June,lure,mute,nude,pure,rude,rule,sure,tube,duke,flute",
    dictationWords: "cube,cute,mule,tune,rude",
    tipsForParents: "Long u is inconsistent — 'sure' sounds like /shor/, 'ruse' is /rooz/. When irregulars come up, acknowledge them: 'That's one of the tricky ones!' and note it on a special list.",
  },
  25: {
    warmup: "Word sort — 'feet or bit? seed or sit? tree or ten?' She categorises into long or short ee/e sound.",
    introduction: "Say: 'Two e's together (ee) make the long /e/ sound — like 'eee' (hold the sound). f-ee-t → /f/ /ee/ /t/ → feet. Whenever you see ee, say the long e sound.' Introduce the pattern: write 'ee' and say 'these two vowels are a team — they make one sound together.'",
    wordList: "feet,seed,tree,need,free,bee,fee,glee,see,tee,beef,deer,feel,heel,keen,peel,reef,reel,seem,teen",
    dictationWords: "feet,seed,tree,need,free",
    tipsForParents: "EE is one of the most consistent vowel teams — it almost always says /ee/. This is a good one to feel successful with! Use the memory hook: 'Two e's walk together, they say their name.'",
  },
  26: {
    warmup: "Minimal pair — 'ea or ee? beat/beet, meat/meet, read/reed, tea/tee.' In real reading, context tells you which meaning; the sound is the same.",
    introduction: "Say: 'EA also makes the long /e/ sound — just like ee! b-ea-t → /b/ /ee/ /t/ → beat. You'll need to remember both spellings make the same sound.' Point out that ea and ee both say /ee/ — the spelling differs but the sound is the same.",
    wordList: "beat,read,meat,team,leaf,beach,bead,bean,deal,each,eat,feast,heat,heal,lean,meal,pea,reach,real,seal",
    dictationWords: "beat,read,meat,team,leaf",
    tipsForParents: "EA sometimes says short /e/ — 'bread', 'dead', 'head'. When she encounters these exceptions, say 'Good phonics try! This ea says the short e sound — it's one of the irregular ones.'",
  },
  27: {
    warmup: "Position game — 'AI goes in the middle of a word: rain. AY goes at the end: day. What position does the vowel team go?' Give 5 examples of each.",
    introduction: "Say: 'AI and AY both make the long /a/ sound. AI comes in the middle of a word: r-ai-n → rain. AY comes at the end: d-ay → day. Let's sort them.' Create two columns — AI words and AY words — as you work through the list.",
    wordList: "rain,tail,wait,play,day,braid,brain,chain,drain,frail,grain,mail,nail,paid,rail,sail,stay,tray,spray,stray",
    dictationWords: "rain,tail,wait,play,day",
    tipsForParents: "The positional rule (AI in middle, AY at end) works most of the time. When she's spelling, ask 'Is the long a sound at the end of the word or in the middle?' to help her choose the right spelling.",
  },
  28: {
    warmup: "Same positional game — 'OA in the middle: boat. OW at the end: snow.' Give examples of each. Note: OW also makes the /ow/ sound (cow) — tell her you're learning the /o/ version today.",
    introduction: "Say: 'OA and OW (when it says /o/) both make the long /o/ sound. b-oa-t → boat. sn-ow → snow.' Sort into OA words (middle position) and OW words (end position). Mention that OW can also say /ow/ as in 'cow' — that's a different sound for later.",
    wordList: "boat,road,coat,snow,slow,croak,float,goat,groan,load,loan,moan,moat,oat,oak,blow,flow,glow,grow,know",
    dictationWords: "boat,road,coat,snow,slow",
    tipsForParents: "When she encounters 'ow' in a new word, she may not know which sound to use (/o/ or /ow/). Tell her to try /o/ first; if it doesn't make a real word, try /ow/. This 'try both' strategy works well.",
  },
  29: {
    warmup: "Minimal pair — 'moon vs book: which has the long oo? food vs good: which has the long oo?' Distinguish long /oo/ (moon) from short /oo/ (book) — note that short oo comes later.",
    introduction: "Say: 'When you see oo in most words, it makes the long /oo/ sound — like 'oooh!' m-oo-n → moon. This is the same sound as 'you' said with your lips in a circle.' Demonstrate the lip rounding for /oo/.",
    wordList: "moon,food,cool,pool,room,bloom,boot,booth,drool,droop,flew,flute,gloom,groom,loop,loom,mood,noon,proof,roof",
    dictationWords: "moon,food,cool,pool,room",
    tipsForParents: "The short /oo/ sound (book, cook) can cause confusion. For now, teach long oo as the default. Introduce the variation when she encounters 'book' type words in reading and explain 'this oo says a different, shorter sound.'",
  },
  30: {
    warmup: "Isolation — 'What's the vowel sound in: car, bar, farm, dark, start?' All have the /ar/ sound. Count them on fingers.",
    introduction: "Say: 'When 'r' comes after a vowel, it changes the vowel sound. 'a' + r = /ar/ — like a pirate: 'arrrr!' c-ar → car.' Introduce r-controlled vowels as a new category: 'the r is bossy — it changes the vowel.'",
    wordList: "car,bar,farm,start,dark,arc,arch,art,barn,card,cart,charm,chart,hard,harm,harp,jar,large,mark,park",
    dictationWords: "car,bar,farm,start,dark",
    tipsForParents: "The 'bossy r' or 'r-controlled' concept is memorable for kids — use it! When she forgets, say 'Remember, r is bossy — what does bossy r do to the a?' The pirate /ar/ is a great mnemonic.",
  },
  31: {
    warmup: "Isolation — 'What sound do you hear in: for, born, corn, port, storm?' All have /or/.",
    introduction: "Say: 'Now bossy r is changing the 'o'. o + r = /or/ — like when you say 'or' in a choice. f-or → for. b-or-n → born.' Compare 'cot' (short o) vs 'corn' (r-controlled or) to show the difference.",
    wordList: "for,born,corn,port,storm,cord,core,cork,fort,ford,form,horn,horse,lord,more,nor,north,ore,pork,torn",
    dictationWords: "for,born,corn,port,storm",
    tipsForParents: "OR is a very common pattern — 'for', 'or', 'more', 'before' appear constantly in books. Mastering this pattern will visibly improve reading fluency.",
  },
  32: {
    warmup: "Sound matching — 'er, ir, ur all make the same sound! Say: her, bird, burn — what do they have in common?' They all say /er/.",
    introduction: "Say: 'The letters er, ir, and ur all make the same /er/ sound — like someone thinking 'uhhhh'. It doesn't matter which spelling you see; they all say the same thing. h-er → her. b-ir-d → bird. b-ur-n → burn.' Teach as a family.",
    wordList: "her,bird,burn,fern,girl,blur,curl,fur,germ,herb,herd,hurt,lurk,nurse,purr,shirt,sir,skirt,stir,turn",
    dictationWords: "her,bird,burn,fern,girl",
    tipsForParents: "Spelling ER/IR/UR is harder than reading it — because they all sound the same, she has to memorize which spelling goes with each word. For now, focus on reading; don't worry too much about correct spelling of these.",
  },

  // ── Phase 4: Advanced ─────────────────────────────────────
  33: {
    warmup: "Minimal pair discrimination — 'Do you hear /oy/ or /ow/? oil, out, coin, cow, toy, town.' Raise hand for /oy/.",
    introduction: "Say: 'OI and OY make the /oy/ sound — like 'oy!' o-il → oil. b-oy → boy. OI goes in the middle of a word; OY goes at the end.' Same positional rule as AI/AY.",
    wordList: "oil,coin,boy,toy,joy,boil,broil,choice,coil,foil,groin,join,joint,moist,noise,point,poise,soil,spoil,toil",
    dictationWords: "oil,coin,boy,toy,joy",
    tipsForParents: "OI/OY is a diphthong — the mouth actually moves mid-sound. Have her say 'oy' and feel her jaw move. This physical awareness helps distinguish it from other vowel sounds.",
  },
  34: {
    warmup: "Minimal pair — 'oy or ow? out, oil, cow, coin, how, hoist.' She identifies which sound she hears.",
    introduction: "Say: 'OU and OW can both make the /ow/ sound — like when something hurts: 'OW!' o-u-t → out. c-ow → cow.' Note that OW can say either /o/ (snow) or /ow/ (cow) — teach context strategy.",
    wordList: "out,loud,cow,now,how,bout,cloud,clout,couch,count,doubt,foul,found,gown,growl,ground,mount,noun,pout,shout",
    dictationWords: "out,loud,cow,now,how",
    tipsForParents: "When she sees OW in a new word, remind her: 'OW can say two things — try /o/ first (like snow), if it's not a real word, try /ow/ (like cow).' This self-correction strategy builds independence.",
  },
  35: {
    warmup: "Compare — 'moon vs book: one has long oo, one has short oo. Can you hear the difference? food/foot, pool/pull, cool/cook.' Long /oo/ vs short /oo/.",
    introduction: "Say: 'OO can also make a shorter sound — like /oo/ but pulled back in your mouth. b-oo-k → book. c-oo-k → cook. It's shorter and the lips aren't as round.' Contrast long oo words (moon) with short oo words (book) side by side.",
    wordList: "book,cook,foot,good,look,brook,crook,full,hook,hood,pull,push,put,rook,shook,should,stood,took,wood,wool",
    dictationWords: "book,cook,foot,good,look",
    tipsForParents: "The short oo vs long oo distinction is subtle. Most kids get it naturally from hearing words. If she confuses them, use real objects: show a 'book' and a 'moon' picture and compare.",
  },
  36: {
    warmup: "Listening for /aw/ — 'Say these words after me: auto, cause, saw, paw, law. What sound do you hear in all of them?' /aw/ — like when the doctor says 'open wide.'",
    introduction: "Say: 'AU and AW both make the /aw/ sound — like you're in awe of something amazing: 'awww!' a-u-t-o → auto. s-aw → saw. AU usually comes in the middle; AW comes at the end or before a consonant.'",
    wordList: "auto,cause,saw,paw,law,aught,awed,awl,awning,bawl,claw,craw,crawl,dawn,draw,fawn,flaw,gnaw,haul,jaw",
    dictationWords: "auto,cause,saw,paw,law",
    tipsForParents: "AU/AW is less common than other patterns but very consistent. The hardest part is distinguishing it from long /o/ — 'claw' vs 'flow'. The lip position is different: /aw/ has an open, dropped jaw.",
  },
  37: {
    warmup: "Sort — 'hard c or soft c? cat, city, cup, cent, code, cycle, can, circle.' Hard c = /k/ before a, o, u. Soft c = /s/ before e, i, y.",
    introduction: "Say: 'C has two sounds — hard /k/ (like cat) and soft /s/ (like city). The NEXT letter tells you which: if e, i, or y follows, c says /s/. If a, o, u follows, c says /k/. Same rule for G.' Teach C and G together as parallel patterns.",
    wordList: "city,cent,gem,giraffe,race,ace,cage,cedar,cell,cycle,face,fence,force,gel,gent,giant,grace,ice,lace,mice",
    dictationWords: "city,cent,gem,race,ice",
    tipsForParents: "The soft c/g rule is a spelling rule as much as a reading rule. When she writes 'sity' for 'city', explain 'We use C before I because C says /s/ when followed by i.' This is counterintuitive but important.",
  },
  38: {
    warmup: "Syllable counting — clap the syllables in: rabbit (2), basket (2), napkin (2), sunset (2), garden (2). All have two closed syllables.",
    introduction: "Say: 'A closed syllable has a SHORT vowel and ends with a consonant — the consonant 'closes' it in. Two-syllable words often have two closed syllables: rab-bit. We split them between the double consonants.' Teach the rule: when two consonants are in the middle, split between them (VCCV pattern).",
    wordList: "rabbit,basket,napkin,sunset,garden,blanket,button,cotton,frozen,hidden,kitten,lesson,mitten,muffin,pebble,pencil,pepper,plastic,problem,puppet",
    dictationWords: "rabbit,basket,button,kitten,napkin",
    tipsForParents: "Syllable division gives her a strategy for multi-syllable words — instead of guessing, she can break the word and decode each part. This is the foundation of reading longer words independently.",
  },
  39: {
    warmup: "Sort — 'open or closed syllable? me (open), men (closed), go (open), got (closed), be (open), bed (closed).' Open = ends with long vowel, closed = ends with consonant.",
    introduction: "Say: 'An open syllable ends with a LONG vowel — nothing closes it in, so the vowel says its name. o-pen = o (long o) + pen. mu-sic = mu (long u) + sic.' Pattern: split before the second consonant for open syllables (VCV pattern — try the long vowel first).",
    wordList: "open,music,paper,tiger,robot,bacon,crater,even,fiber,frozen,human,label,laser,locate,major,motor,radar,silent,student,total",
    dictationWords: "open,music,paper,tiger,robot",
    tipsForParents: "The VCV split strategy: try the long vowel first (open syllable). If it doesn't make a real word, try splitting after the consonant (closed syllable). 'Robin' — ro-bin (open/closed) doesn't work; rob-in does.",
  },
  40: {
    warmup: "Magic e review — decode: blame, stone, drove, stripe, close. These are VCe syllables inside longer words.",
    introduction: "Say: 'VCe syllables appear inside bigger words too — the silent e still makes the vowel long. costume = cos + tume. mis-take = mis + take.' Identify the VCe pattern within multi-syllable words.",
    wordList: "costume,mistake,compete,complete,concrete,confuse,convene,delete,discrete,extreme,ignite,immune,include,inflate,invade,invite,locate,produce,remote,translate",
    dictationWords: "mistake,complete,remote,inflate,costume",
    tipsForParents: "Multi-syllable VCe words are much harder because the word is longer and there are more places where she might get lost. Encourage her to decode syllable by syllable: 'Let's just do the first part first.'",
  },
  41: {
    warmup: "Vowel team review — 'ai, ay, ee, ea, oa, ow, oo — what sound does each make?' Flash drill.",
    introduction: "Say: 'Vowel teams can be in any syllable of a multi-syllable word — not just short ones. ex-plain = ex + plain (ai team). com-plain, re-main, de-feat, re-peat.' Identify the syllable boundary and the vowel team together.",
    wordList: "explain,complain,contain,obtain,retain,defeat,repeat,release,believe,relief,conceal,appeal,domain,remain,attain,display,delay,portray,cartoon,balloon",
    dictationWords: "explain,complain,contain,defeat,remain",
    tipsForParents: "At this stage she's reading 2-3 syllable words — celebrate this! Point out vowel teams she knows in new words: 'I see a vowel team in there — can you spot it?' This metacognitive awareness accelerates progress.",
  },
  42: {
    warmup: "R-controlled review — 'er, ir, ur, ar, or — what sound?' Flash drill each pattern.",
    introduction: "Say: 'R-controlled syllables appear in the middle of long words too — any syllable can have a bossy r. far-mer = far (ar) + mer (er). cor-ner = cor (or) + ner (er).' Find the r-controlled syllable in each word.",
    wordList: "farmer,corner,birthday,carpet,circle,garden,harbor,market,mirror,monster,order,partner,party,perfect,person,purple,river,sermon,shelter,target",
    dictationWords: "farmer,corner,birthday,carpet,market",
    tipsForParents: "By this point, she should be chunking words rather than sounding out phoneme by phoneme. If she's still sounding out every letter, practice at the syllable level — decode one syllable at a time.",
  },
  43: {
    warmup: "Vocabulary game — 'What's the opposite of happy?' Sad. 'What if I put UN before happy?' Unhappy! Do: lock/unlock, tie/untie, fair/unfair.",
    introduction: "Say: 'UN- is a prefix — it goes at the start of a word and changes its meaning to the OPPOSITE. un + happy = unhappy. The root word is still there, just with un- in front. When you see a word starting with UN, find the root word inside it.'",
    wordList: "undo,unhappy,unlock,untie,unclear,unclean,undone,unfair,unfold,unhurt,unkind,unknown,unlike,unload,unmade,unpack,unreal,unsafe,untrue,unwell",
    dictationWords: "undo,unhappy,unlock,untie,unfair",
    tipsForParents: "Prefix awareness is a huge boost to vocabulary and reading comprehension. Make a game of it: 'If 'kind' means nice, what does 'unkind' mean?' This cross-curricular thinking builds fast.",
  },
  44: {
    warmup: "Vocabulary game — 'What does 'do' mean? What about 're-do'? What does 'play' mean? What about 'replay'?' The RE- prefix means 'again'.",
    introduction: "Say: 'RE- means 'do it again'. re + do = redo = do it again. When you see RE- at the start of a word, find the root word and add 'again' to the meaning.' Practice with familiar action words.",
    wordList: "redo,return,replay,reread,rebuild,recall,recharge,reclaim,recycle,refill,regain,reheat,rejoin,relearn,remind,renew,reopen,replace,reset,restart",
    dictationWords: "redo,return,replay,reread,restart",
    tipsForParents: "RE- words appear constantly in instructions and school texts. When she reads 'rewrite your story', being able to decode and understand RE- makes a real difference to comprehension.",
  },
  45: {
    warmup: "Word building — 'run + ing? What happens to the n? running — we double the final consonant!' Try: hop+ing, sit+ing, make+ing (drop the e).",
    introduction: "Say: '-ING means an action is happening right now or continuing. jump + ing = jumping. For most words, just add -ing. But: if the word ends in a short vowel + consonant, double the consonant first (running). If it ends in silent e, drop the e first (making).'",
    wordList: "running,jumping,reading,eating,swimming,baking,camping,catching,cleaning,climbing,cooking,dancing,driving,falling,flying,hiding,holding,hunting,laughing,sleeping",
    dictationWords: "running,jumping,reading,eating,swimming",
    tipsForParents: "The doubling rule (run→running) and the drop-e rule (make→making) are spelling rules she'll need for years. Don't expect mastery now — just introduce the concept and revisit it when she encounters examples in writing.",
  },
  46: {
    warmup: "Sort — '-ed words: jumped (sounds like /t/), played (sounds like /d/), wanted (sounds like /id/). Three sounds for one spelling!' Sort by pronunciation.",
    introduction: "Say: '-ED goes at the end of a verb to show it happened in the past. It has 3 sounds: /t/ after voiceless consonants (jumped), /d/ after voiced sounds (played), /id/ after t or d (wanted). Don't worry about the rule too much — say the word naturally.'",
    wordList: "jumped,played,wanted,walked,called,asked,baked,carried,checked,cleaned,cooked,crashed,cried,danced,fixed,grabbed,helped,hugged,kicked,kissed",
    dictationWords: "jumped,played,wanted,walked,called",
    tipsForParents: "In reading, she just needs to recognize -ED at the end and know it's past tense. In spelling, she'll write '-ed' consistently regardless of how it sounds (which is correct). Don't overcorrect 'walkt' — just show her the -ed spelling.",
  },
  47: {
    warmup: "Word meaning game — 'What does 'help' mean? Helpful? Slowly? What's a station?' Build vocabulary alongside the suffix lesson.",
    introduction: "Say: 'Suffixes go at the END of a word and change its meaning or how it's used. -ful means full of something (helpful = full of help). -ly means in that way (slowly = in a slow way). -tion and -sion turn a verb into a noun (act → action).'",
    wordList: "helpful,slowly,station,action,careful,clearly,creation,curious,darkly,election,fearful,finally,formation,gladly,graceful,honestly,joyful,loudly,mention,nation",
    dictationWords: "helpful,slowly,station,action,careful",
    tipsForParents: "-TION is extremely common in academic and informational text. The 'shun' sound is irregular — she may try to decode it as 't-i-o-n'. Teach: 'When you see -tion, it says /shun/.''",
  },
  48: {
    warmup: "Say a big word slowly and clap each syllable: but-ter-fly (3), el-e-phant (3), ad-ven-ture (3), un-der-stand (3), in-ter-est-ing (4). Count the claps.",
    introduction: "Say: 'Big words are just small words stuck together! Your strategy: 1) Look for prefixes at the start (un-, re-). 2) Look for suffixes at the end (-ing, -ed, -ful, -tion). 3) Break what's left into syllables. 4) Decode each part. 5) Put it back together.' Model with: 'uncomfortable' = un + comfort + able.",
    wordList: "butterfly,elephant,adventure,comfortable,community,celebrate,dangerous,education,excellent,experiment,government,important,interesting,knowledge,paragraph,particular,remember,scientists,temperature,understanding",
    dictationWords: "butterfly,elephant,adventure,celebrate,important",
    tipsForParents: "This is the capstone skill. If she uses the prefix/suffix/syllable strategy independently on new words — even when she makes mistakes — that's success. The goal is a self-sufficient decoder, not a perfect one.",
  },
};

// ─────────────────────────────────────────────────────────────
// RESOURCES
// ─────────────────────────────────────────────────────────────

const RESOURCES = [
  {
    name: "Progressive Phonics — Full Program PDFs",
    url: "http://progressivephonics.com",
    description: "Free downloadable structured phonics program with decodable books. Covers beginner through advanced levels. Print and use.",
    type: "book",
    isFree: 1,
    phonicsLevelMin: 1,
    phonicsLevelMax: 48,
  },
  {
    name: "Khan Academy Kids",
    url: "https://learn.khanacademy.org/khan-academy-kids/",
    description: "Systematic phonics app — no ads, free, covers all levels. Great for independent practice between sessions.",
    type: "app",
    isFree: 1,
    phonicsLevelMin: 1,
    phonicsLevelMax: 20,
  },
  {
    name: "Teach Your Monster to Read",
    url: "https://www.teachyourmonstertoread.com",
    description: "Gamified phonics app — free on web browser. Works through CVC to more advanced patterns.",
    type: "app",
    isFree: 1,
    phonicsLevelMin: 1,
    phonicsLevelMax: 20,
  },
  {
    name: "Starfall.com — Phonics Activities",
    url: "https://www.starfall.com",
    description: "Interactive phonics sequence — free version covers CVC and early blends. Great warmup activity.",
    type: "website",
    isFree: 1,
    phonicsLevelMin: 1,
    phonicsLevelMax: 19,
  },
  {
    name: "FCRR Student Center Activities",
    url: "https://fcrr.org/student-center-activities",
    description: "Research-based printable activities organized by skill and grade. Print, laminate, and reuse.",
    type: "printable",
    isFree: 1,
    phonicsLevelMin: 1,
    phonicsLevelMax: 48,
  },
  {
    name: "Storyline Online — Read-Alouds",
    url: "https://storylineonline.net",
    description: "Celebrity read-alouds of popular children's books. Use for vocabulary and comprehension (not phonics) — above her current reading level is fine.",
    type: "website",
    isFree: 1,
    phonicsLevelMin: 1,
    phonicsLevelMax: 48,
  },
  {
    name: "Bob Books Set 1 — Decodable Readers (CVC)",
    url: "https://scholastic.com/bobbooks",
    description: "Classic decodable CVC books. Check local library first. If buying: ~$15/set on Amazon. Perfect for skills 1-9.",
    type: "book",
    isFree: 0,
    phonicsLevelMin: 1,
    phonicsLevelMax: 9,
  },
  {
    name: "Bob Books Set 3 — Word Families & Blends",
    url: "https://scholastic.com/bobbooks",
    description: "Decodable books covering blends and digraphs. Use alongside Phase 2 skills 10-20.",
    type: "book",
    isFree: 0,
    phonicsLevelMin: 10,
    phonicsLevelMax: 20,
  },
  {
    name: "Dog on a Log Books (Free PDF)",
    url: "https://dogonalogbooks.com/free-printable-books/",
    description: "Free printable decodable books, organized by phonics level. Excellent variety — CVC through multisyllabic.",
    type: "book",
    isFree: 1,
    phonicsLevelMin: 1,
    phonicsLevelMax: 36,
  },
  {
    name: "Flyleaf Publishing — Free Decodable Books",
    url: "https://flyleafpublishing.com/free-decodable-books/",
    description: "Free decodable books organized by phonics skill (CVC, digraphs, blends, long vowels). High quality.",
    type: "book",
    isFree: 1,
    phonicsLevelMin: 1,
    phonicsLevelMax: 32,
  },
  {
    name: "Reading A-Z — Leveled Readers",
    url: "https://readinga-z.com",
    description: "Large library of leveled decodable and instructional texts. Free 14-day trial; paid after. Worth it for the decodable library.",
    type: "website",
    isFree: 0,
    phonicsLevelMin: 1,
    phonicsLevelMax: 48,
  },
  {
    name: "Elkonin Boxes Printable (Sound Boxes)",
    url: "https://fcrr.org/student-center-activities",
    description: "Print blank Elkonin boxes for phonemic awareness — push a token into each box as you say each sound. Concrete tool for blending and segmenting.",
    type: "printable",
    isFree: 1,
    phonicsLevelMin: 1,
    phonicsLevelMax: 12,
  },
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Updating phonics skills with lesson content...");

  for (const [seqOrderStr, content] of Object.entries(LESSON_CONTENT)) {
    const seqOrder = parseInt(seqOrderStr, 10);
    await db
      .update(schema.phonicsSkills)
      .set(content)
      .where(eq(schema.phonicsSkills.sequenceOrder, seqOrder));
    process.stdout.write(".");
  }
  console.log(`\n✓ Updated ${Object.keys(LESSON_CONTENT).length} skills with lesson content`);

  console.log("Seeding resources...");
  for (const resource of RESOURCES) {
    await db.insert(schema.resources).values(resource).onConflictDoNothing();
  }
  console.log(`✓ Seeded ${RESOURCES.length} resources`);
}

main().catch(console.error);
```

- [ ] **Step 2: Run the seed**

```bash
npm run db:seed
```

Expected: dots printing (48 of them), then `✓ Updated 48 skills with lesson content` and `✓ Seeded 12 resources`.

- [ ] **Step 3: Verify in Neon that lesson content is populated**

```bash
# Quick check — should print a warmup for skill 1
npx tsx --env-file=.env.local -e "
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
const rows = await sql('SELECT name, warmup FROM phonics_skills WHERE sequence_order = 1');
console.log(rows[0]);
"
```

Expected: object with `name` and a non-null `warmup` string.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/seed.ts
git commit -m "seed: add full lesson content (48 skills) and resources table"
```

---

## Task 2: Add server actions for lesson detail page

**Files:**
- Modify: `src/lib/actions.ts`

- [ ] **Step 1: Add `getSkillById` and `getResources` to actions.ts**

Add the following two functions to the end of `src/lib/actions.ts`:

```typescript
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
  const { lte, gte } = await import("drizzle-orm");
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
```

Also add `resources` to the import at line 4:
```typescript
import { phonicsSkills, sessions, books, assessments, resources } from "./db/schema";
```

And add `and` to the drizzle-orm import at line 5:
```typescript
import { eq, desc, asc, and, lte, gte } from "drizzle-orm";
```

(Remove the dynamic import of drizzle-orm inside `getResources` — import everything at the top.)

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions.ts
git commit -m "feat: add getSkillById and getResources server actions"
```

---

## Task 3: Build the lesson detail page

**Files:**
- Create: `src/app/phonics/[id]/page.tsx`

Read `node_modules/next/dist/docs/` for current dynamic route conventions before writing. The existing pattern in this codebase (see `src/app/phonics/page.tsx`) uses:
- `export const dynamic = "force-dynamic"` at top
- `async function` component

- [ ] **Step 1: Create `src/app/phonics/[id]/page.tsx`**

```typescript
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

  const resources = await getResources(skill.sequenceOrder, skill.sequenceOrder);

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
      {resources.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Matching Books &amp; Resources</h2>
          <div className="space-y-2">
            {resources.map((r) => (
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
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Fix any errors before proceeding.

- [ ] **Step 3: Start dev server and verify the page renders**

```bash
npm run dev
```

Navigate to `http://localhost:3000/phonics/1` — should show the Short Vowel A lesson plan with warmup, introduction, word list, dictation, tips, and resources.

- [ ] **Step 4: Commit**

```bash
git add src/app/phonics/[id]/page.tsx
git commit -m "feat: add lesson detail page /phonics/[id]"
```

---

## Task 4: Add "Start Lesson" button to phonics map cards

**Files:**
- Modify: `src/app/phonics/phonics-map.tsx`

The existing card is an HTML `<button>` that handles status cycling on click. We need to add a separate "Start Lesson" link without breaking the status-cycling click.

- [ ] **Step 1: Add Link import and "Start Lesson" button to phonics-map.tsx**

Add to imports (top of file):
```typescript
import Link from "next/link";
```

Replace the inner button content (lines 95–109) with:
```tsx
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
```

The `e.stopPropagation()` prevents the parent `<button>`'s onClick (status cycle) from firing when clicking the link.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Run dev and verify**

```bash
npm run dev
```

Open `http://localhost:3000/phonics` — each skill card should now have a "Start lesson →" link. Clicking the card body still cycles the status; clicking the link navigates to the lesson page.

- [ ] **Step 4: Commit**

```bash
git add src/app/phonics/phonics-map.tsx
git commit -m "feat: add Start Lesson link to each skill card on phonics map"
```

---

## Done

After all 4 tasks:
- `npm run db:seed` has populated all 48 skills with warmup, introduction, word list, dictation, and parent tips
- 12 resources are seeded (free books, apps, websites)
- `/phonics` map shows "Start lesson →" on every card
- `/phonics/[id]` shows a full 15-minute session plan with matching resources
- Parent can open any skill, see exactly what to say, and have the right books/apps linked

**Verify the full flow:**
1. Go to `/phonics`
2. Find a skill — click "Start lesson →"
3. Read the warm-up, introduction, practice words, and dictation words
4. Check the resources section for matching books
5. Log the session at `/sessions/new`
