import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// ─────────────────────────────────────────────────────────────
// LLLL SKILLS — 63 skills following the Little Learners Love
// Literacy® Foundation + Year 1 teaching sequence.
// ─────────────────────────────────────────────────────────────

type SkillRow = {
  name: string;
  category: string;
  sequenceOrder: number;
  stage: string;
  heartWords: string;
  examples: string;
  warmup: string;
  introduction: string;
  wordList: string;
  dictationWords: string;
  tipsForParents: string;
};

const SKILLS: SkillRow[] = [

  // ── Stage 1 — m s f a p t c i ────────────────────────────
  {
    name: "m", category: "Stage 1", sequenceOrder: 1, stage: "1",
    heartWords: "I, a, the, is, it, in, on, at",
    examples: "mat,mop,mud,map",
    warmup: "Mouth movement warm-up — say /m/ and feel your lips press together. Say it 5 times fast: /m/ /m/ /m/ /m/ /m/. Then hum like a bumblebee: mmmmm.",
    introduction: "Say: 'The letter m makes the /m/ sound — like a bumblebee hum. Say /m/. Let's blend: m-a-t → /m/ /a/ /t/ → mat. Watch me point to each letter as I say its sound, then push them together.' Model 2 words before the child tries.",
    wordList: "mat,mop,mud,map,mom,him,sum,rim,gem,ham,dam,ram,yam,gum,rum,dim,hum,jam,elm,vim",
    dictationWords: "mat,mop,mud,map,him",
    tipsForParents: "Make sure she presses her lips together for /m/ — it should feel like a hum. If she says /b/ instead, remind her: 'b pops open, m hums.' Keep sessions short (5–10 min) and celebrate every correct blend.",
  },
  {
    name: "s", category: "Stage 1", sequenceOrder: 2, stage: "1",
    heartWords: "I, a, the, is, it, in, on, at",
    examples: "sat,sip,sob,sum",
    warmup: "Snake sound — make a long ssssss like a snake. Practice starting and stopping: sss… stop… sss… stop. Then count: how many /s/ sounds in 'sat, sit, set'?",
    introduction: "Say: 'S makes the /s/ sound — like a hissing snake. Say /s/. Let's decode: s-a-t → /s/ /a/ /t/ → sat. Point to each letter with your finger.' Model clearly before the child decodes independently.",
    wordList: "sat,sip,sob,sum,six,set,sub,sap,sin,sot,bus,gas,his,pus,yes,us,as,sis,sill,sell",
    dictationWords: "sat,sip,sob,sum,set",
    tipsForParents: "Watch for the difference between /s/ (unvoiced) and /z/ (voiced). If she voices it, say 'No buzz — just air: ssss.' The letter s is high frequency so this foundation matters.",
  },
  {
    name: "f", category: "Stage 1", sequenceOrder: 3, stage: "1",
    heartWords: "I, a, the, is, it, in, on, at",
    examples: "fat,fit,fig,fog",
    warmup: "Fan feel — hold your hand in front of your mouth. Say /f/ and feel the air on your hand. Compare /f/ (top teeth on bottom lip) vs /v/ (same but with voice). Practice 5 times.",
    introduction: "Say: 'F makes the /f/ sound — bite your bottom lip lightly and blow air. Say /f/. Let's decode: f-a-t → /f/ /a/ /t/ → fat.' Model teeth-on-lip position before blending words.",
    wordList: "fat,fit,fig,fog,fun,fen,fin,fob,fad,fan,elf,off,if,left,lift,soft,loft,tuft,gift,raft",
    dictationWords: "fat,fit,fog,fun,fan",
    tipsForParents: "F is often confused with v or ph. Make sure she touches her top front teeth to her bottom lip — the physical sensation is the anchor. 'F blows air, v has a buzz.'",
  },
  {
    name: "a", category: "Stage 1", sequenceOrder: 4, stage: "1",
    heartWords: "I, a, the, is, it, in, on, at",
    examples: "ant,and,am,ask",
    warmup: "Short vowel stretch — say /a/ and hold it: aaaa. Now say these words slowly, stretching the middle sound: cat → c-aaa-t, hat → h-aaa-t, bag → b-aaa-g.",
    introduction: "Say: 'Short a says /a/ — like when you open your mouth at the doctor. Say /a/. It is the middle sound in words like cat and hat. Let's blend: c-a-t → /k/ /a/ /t/ → cat.' Focus on the vowel being the 'glue' between consonants.",
    wordList: "ant,and,am,ask,at,an,act,add,apt,bag,bat,cap,dab,fan,gap,had,jam,lap,map,nap",
    dictationWords: "ant,am,at,bag,cap",
    tipsForParents: "Short /a/ is the most common CVC vowel. Keep returning to it. If she confuses it with short /e/, hold a mirror and show her that /a/ opens the mouth wider. 'Apple has a wide-open mouth.'",
  },
  {
    name: "p", category: "Stage 1", sequenceOrder: 5, stage: "1",
    heartWords: "I, a, the, is, it, in, on, at",
    examples: "pat,pit,pan,pot",
    warmup: "Pop sound — hold a piece of paper in front of your mouth. Say /p/ and watch the paper move (the air puff). Do 5 pops: /p/ /p/ /p/ /p/ /p/.",
    introduction: "Say: 'P makes a pop sound — /p/. Hold your lips together then let a puff of air burst out. Let's decode: p-a-t → /p/ /a/ /t/ → pat.' Compare with /b/: both pop but p has no voice.",
    wordList: "pat,pit,pan,pot,pup,pen,pin,pod,peg,pal,cap,dip,gap,hip,lap,map,nap,rap,sap,tap",
    dictationWords: "pat,pit,pan,pot,pen",
    tipsForParents: "P and b are commonly confused (mirror images). If this happens, remind her: 'P is quiet — no voice. B is loud — say /b/ and feel your throat.' Use the paper-puff trick as a visual check.",
  },
  {
    name: "t", category: "Stage 1", sequenceOrder: 6, stage: "1",
    heartWords: "I, a, the, is, it, in, on, at",
    examples: "tap,tip,tan,top",
    warmup: "Tip-tap rhythm — tap the table once for each sound: /t/-/a/-/p/ = 3 taps. Do: tan, tip, top, tin, tot. Count your taps each time.",
    introduction: "Say: 'T makes the /t/ sound — tongue tip touches the top of your mouth, then drops: /t/. Let's decode: t-a-p → /t/ /a/ /p/ → tap.' Model the tongue position (behind top teeth) clearly.",
    wordList: "tap,tip,tan,top,tug,ten,tin,tot,tab,tat,bat,bit,cat,dot,fat,fit,get,hat,hit,kit",
    dictationWords: "tap,tip,tan,top,tin",
    tipsForParents: "T is often softened into a /d/ by some children. Make sure the tap is crisp and unvoiced. 'T is quiet — no hum.' Reinforce with the tongue-behind-top-teeth position.",
  },
  {
    name: "c", category: "Stage 1", sequenceOrder: 7, stage: "1",
    heartWords: "I, a, the, is, it, in, on, at",
    examples: "cat,cap,cab,cod",
    warmup: "Back-of-mouth sound — say /k/ and notice where your tongue is (back of mouth). Say /k/ 5 times. Then blend with vowels: /k/-/a/, /k/-/i/, /k/-/o/.",
    introduction: "Say: 'C usually makes the /k/ sound — the back of your tongue touches the back of your mouth. Say /k/. c-a-t → /k/ /a/ /t/ → cat.' Note: before a, o, u — c says /k/. Keep it simple for now.",
    wordList: "cat,cap,cab,cod,cub,can,cot,cup,cut,cog,act,arc,deck,kick,lock,mock,peck,rack,sick,tack",
    dictationWords: "cat,cap,cod,cub,cut",
    tipsForParents: "Teach c as /k/ for now — do not introduce soft c (city, cent) yet. That comes in Stage 7.4. If she asks about 'cent', say 'Good question — c sometimes says /s/, but for now we use the /k/ sound.'",
  },
  {
    name: "i", category: "Stage 1", sequenceOrder: 8, stage: "1",
    heartWords: "I, a, the, is, it, in, on, at",
    examples: "it,in,ill,ink",
    warmup: "Short i isolation — say each word and clap when you hear short /i/: sit, cat, pin, pot, big, bat, him, hop. Quick fire: how many /i/ words did you find?",
    introduction: "Say: 'Short i says /i/ — like a quick itch. Say /i/. It is the middle sound in sit, pin, big. Let's blend: s-i-t → /s/ /i/ /t/ → sit. Point to each letter.' Compare short /i/ and short /a/ by saying 'sit' vs 'sat'.",
    wordList: "it,in,ill,ink,if,inn,big,bit,did,fig,fit,him,hip,hit,kid,lid,lip,mix,nip,pig",
    dictationWords: "it,in,big,bit,him",
    tipsForParents: "Short /i/ and short /e/ are the most commonly confused vowels. If she mixes them up (pen/pin), isolate the vowel: 'Say the middle sound in pin — is it /i/ or /e/?' Use minimal pairs for practice.",
  },

  // ── Stage 2 — b h n o d g l v ─────────────────────────────
  {
    name: "b", category: "Stage 2", sequenceOrder: 9, stage: "2",
    heartWords: "my, to, he, she, we, be, me, no, go",
    examples: "bat,bit,bad,bog",
    warmup: "B and p contrast — say /b/ (voiced pop) then /p/ (quiet pop). Put your hand on your throat: /b/ buzzes, /p/ doesn't. Do 5 of each.",
    introduction: "Say: 'B makes the /b/ sound — like a buzzing pop. Your lips push together and your voice turns on. Say /b/. Let's decode: b-a-t → /b/ /a/ /t/ → bat.'",
    wordList: "bat,bit,bad,bog,bun,bed,bin,bob,beg,bib,cab,dab,hub,jab,lab,rib,rob,rub,sub,tab",
    dictationWords: "bat,bit,bad,bun,bed",
    tipsForParents: "B and d reversals are extremely common (b looks like a bed, d looks like a drum — use those images). If she reverses, don't panic. Say 'b has its belly to the right, d has its belly to the left.'",
  },
  {
    name: "h", category: "Stage 2", sequenceOrder: 10, stage: "2",
    heartWords: "my, to, he, she, we, be, me, no, go",
    examples: "hat,hit,had,hop",
    warmup: "Breath check — hold your hand close to your mouth. Say /h/ and feel warm air. Say these words and notice the starting breath: hat, hop, hit, him, hot. /h/ is just a puff of warm air.",
    introduction: "Say: 'H makes the /h/ sound — it is just a breath of warm air. Say /h/. Let's decode: h-a-t → /h/ /a/ /t/ → hat.' H only appears at the start of a syllable in common words.",
    wordList: "hat,hit,had,hop,hug,hen,him,his,hob,hub,ham,hip,hot,hid,hem,hap,hob,hum,hag,hex",
    dictationWords: "hat,hit,had,hop,hen",
    tipsForParents: "H is simple — the main challenge is 'wh' words like 'what' which look like they start with /w/ but have the h visible. For now just enjoy h words. 'H is just a breath — no voice, no lip movement.'",
  },
  {
    name: "n", category: "Stage 2", sequenceOrder: 11, stage: "2",
    heartWords: "my, to, he, she, we, be, me, no, go",
    examples: "nap,nit,net,nod",
    warmup: "Nose hum — say /n/ and feel your nose tingle (it is a nasal sound). Hold your nose and try to say /n/ — it is blocked! Say: /n/ /n/ /n/ then blend: /n/-/e/-/t/ → net.",
    introduction: "Say: 'N makes the /n/ sound — your tongue touches behind your top teeth and air goes through your nose. Say /n/. Let's decode: n-a-p → /n/ /a/ /p/ → nap.' Feel the nose tingle.",
    wordList: "nap,nit,net,nod,nut,nab,nil,nag,nun,nub,ban,bin,bun,can,den,fan,fun,gun,hen,inn",
    dictationWords: "nap,net,nod,nut,nab",
    tipsForParents: "N before g (ng) sounds different — this comes in Stage 6. For now n is always /n/. If she notices 'sink' sounds different, say 'Good ears — we will learn about ng later.'",
  },
  {
    name: "o", category: "Stage 2", sequenceOrder: 12, stage: "2",
    heartWords: "my, to, he, she, we, be, me, no, go",
    examples: "on,off,odd,ox",
    warmup: "Doctor sound — open your mouth wide and say /o/ like the doctor asks. Say these words and stretch the middle: dog → d-ooo-g, hot → h-ooo-t, fog → f-ooo-g.",
    introduction: "Say: 'Short o says /o/ — like when the doctor says open wide. Say /o/. It is the middle sound in dog and hot. Let's blend: d-o-g → /d/ /o/ /g/ → dog.'",
    wordList: "on,off,odd,ox,opt,bob,cod,cog,cop,dot,fog,got,hog,hop,hot,job,log,lot,mob,mop",
    dictationWords: "on,odd,bob,dog,hot",
    tipsForParents: "Short /o/ is often confused with short /u/ (hot/hut). Exaggerate your mouth opening for /o/: wide and round. For /u/ your mouth is more relaxed. 'O is a big open O shape, u is more neutral.'",
  },
  {
    name: "d", category: "Stage 2", sequenceOrder: 13, stage: "2",
    heartWords: "my, to, he, she, we, be, me, no, go",
    examples: "dad,dip,den,dot",
    warmup: "D and b contrast — 'b has belly to the right (b), d has belly to the left (d).' Practise writing both in the air. Then say: /b/ dog, /d/ bat — spot the wrong sound! Fix: dog = /d/, bat = /b/.",
    introduction: "Say: 'D makes the /d/ sound — tongue tip touches behind your top teeth then drops, with voice. Say /d/. Let's decode: d-o-g → /d/ /o/ /g/ → dog.' Contrast with t (same position, but t has no voice).",
    wordList: "dad,dip,den,dot,dug,dab,dam,dim,dob,don,bad,bid,bud,cod,fed,had,hid,kid,led,mad",
    dictationWords: "dad,dip,den,dot,dug",
    tipsForParents: "The b/d reversal is extremely common in early readers. The 'bed' trick: make a fist with both hands and put thumbs up — left hand makes b, right hand makes d. Together they spell 'bed'.",
  },
  {
    name: "g", category: "Stage 2", sequenceOrder: 14, stage: "2",
    heartWords: "my, to, he, she, we, be, me, no, go",
    examples: "gap,gig,get,got",
    warmup: "Gargle sound — g is made at the back of the throat, like starting to gargle. Say /g/ 5 times. Notice it is the voiced version of /k/ (same place, add voice).",
    introduction: "Say: 'G makes the /g/ sound — back of tongue, back of mouth, voice on. Say /g/. Let's decode: g-o-t → /g/ /o/ /t/ → got.' Before a, o, u — g says /g/. Soft g (giant) comes much later.",
    wordList: "gap,gig,get,got,gum,gab,gel,gem,gin,gob,bag,big,bog,bug,dig,dog,dug,egg,fig,fog",
    dictationWords: "gap,get,got,gum,bag",
    tipsForParents: "Teach hard g (/g/) only for now. If she encounters 'gentle' or 'giraffe', say 'This g has a special sound — we will learn it later.' Do not introduce soft g yet.",
  },
  {
    name: "l", category: "Stage 2", sequenceOrder: 15, stage: "2",
    heartWords: "my, to, he, she, we, be, me, no, go",
    examples: "lap,lid,let,lot",
    warmup: "Tongue tip up — say /l/ and feel your tongue tip touch just behind your top teeth. Hold it there and hum: lll. Blend with vowels: /l/-/a/, /l/-/i/, /l/-/o/, /l/-/u/, /l/-/e/.",
    introduction: "Say: 'L makes the /l/ sound — tongue tip touches the bumpy ridge behind your top teeth. Say /l/. Let's decode: l-a-p → /l/ /a/ /p/ → lap.'",
    wordList: "lap,lid,let,lot,lug,lab,leg,lip,log,lob,all,ell,ill,pal,gel,gal,nil,sol,bell,bill",
    dictationWords: "lap,lid,let,lot,lug",
    tipsForParents: "L is usually mastered well. Watch for children saying /w/ instead of /l/ (common in younger children). If this happens, model the tongue position in a mirror: tongue tip up to the bumpy ridge.",
  },
  {
    name: "v", category: "Stage 2", sequenceOrder: 16, stage: "2",
    heartWords: "my, to, he, she, we, be, me, no, go",
    examples: "van,vim,vet,vow",
    warmup: "F and v contrast — make /f/ (quiet) then /v/ (buzzy). Touch your throat: /f/ = no vibration, /v/ = vibration. Say: fan/van, fine/vine, fat/vat. Spot the difference.",
    introduction: "Say: 'V makes the /v/ sound — teeth on bottom lip like F, but add your voice. Say /v/ and feel the buzz. Let's decode: v-a-n → /v/ /a/ /n/ → van.'",
    wordList: "van,vim,vet,vow,vat,vex,via,vim,void,vulva,eve,give,have,live,love,move,prove,save,wave,dive",
    dictationWords: "van,vet,vow,vat,vex",
    tipsForParents: "V only appears at the start of syllables in simple words. Note that 'have', 'give', 'live' end in silent-e but the vowel is still short — these are irregular. Teach them as sight words when encountered.",
  },

  // ── Stage 3 — y r e qu z ───────────────────────────────────
  {
    name: "y", category: "Stage 3", sequenceOrder: 17, stage: "3",
    heartWords: "was, are, you, they, said, have, of, do",
    examples: "yap,yip,yet,yob",
    warmup: "Y as a consonant — say /y/ at the start of: yes, yap, yell, yam, yip. Notice your tongue arches toward the roof of your mouth. Y at the start of words = /y/ consonant sound.",
    introduction: "Say: 'Y at the start of a word makes the /y/ consonant sound — like yes and yell. Say /y/. Let's decode: y-a-p → /y/ /a/ /p/ → yap.' Note: y at the end of words (like funny) makes a vowel sound — that comes later in Stage 7.",
    wordList: "yap,yip,yet,yob,yum,yell,yam,yak,yen,yep,yew,yoga,York,yarn,yard,yore,yolk,yore,you,yield",
    dictationWords: "yap,yip,yet,yum,yell",
    tipsForParents: "Y is tricky because it has both a consonant role (yes) and vowel roles (funny, fly). Keep it simple now: y at the start = /y/. Introduce vowel y roles when they come up in Stage 7.",
  },
  {
    name: "r", category: "Stage 3", sequenceOrder: 18, stage: "3",
    heartWords: "was, are, you, they, said, have, of, do",
    examples: "rap,rip,red,rob",
    warmup: "Growl sound — growl like a lion: rrrrr. Feel the back of your tongue rise slightly. Say /r/ 5 times. Then blend: /r/-/e/-/d/ → red. /r/-/u/-/n/ → run.",
    introduction: "Say: 'R makes the /r/ sound — growl like a lion. Say /r/. Let's decode: r-a-p → /r/ /a/ /p/ → rap.' R before vowels is straightforward; r after vowels (ar, or, er) comes later in Stage 7.",
    wordList: "rap,rip,red,rob,run,ram,rat,rim,rod,rub,bar,car,far,for,fur,her,jar,nor,sir,tar",
    dictationWords: "rap,rip,red,rob,run",
    tipsForParents: "Some children use a /w/ sound for r (wed for red). This often resolves naturally. If it persists, model the lip position: r has no lip rounding, w does. A speech therapist can help if this continues past age 7.",
  },
  {
    name: "e", category: "Stage 3", sequenceOrder: 19, stage: "3",
    heartWords: "was, are, you, they, said, have, of, do",
    examples: "egg,end,elk,elm",
    warmup: "Short e isolation — say 'eh' like a confused shrug. Now find short e in: bed, hen, pet, red, web, beg, leg, den, get, yet. Raise your hand for each /e/ word.",
    introduction: "Say: 'Short e says /e/ — like a surprised eh? Say /e/. It is the middle sound in bed and hen. Let's blend: b-e-d → /b/ /e/ /d/ → bed.' Short e is the trickiest vowel — contrast with short i.",
    wordList: "egg,end,elk,elm,elf,bed,beg,den,fed,gem,get,hen,jet,leg,men,met,net,peg,pet,red",
    dictationWords: "egg,end,bed,hen,get",
    tipsForParents: "Short /e/ vs short /i/ is a very common confusion (pen/pin, bed/bid). Use minimal pairs: say 'pen' then 'pin' slowly and ask her to hear the difference. A mirror can help — /e/ opens the mouth slightly wider than /i/.",
  },
  {
    name: "qu", category: "Stage 3", sequenceOrder: 20, stage: "3",
    heartWords: "was, are, you, they, said, have, of, do",
    examples: "quit,quip,quiz,quest",
    warmup: "Double team — qu always travel together. Say /kw/: /k/ + /w/ squeezed together. Practice: /kw/-/i/-/t/ → quit. Tap once for qu (it is one sound unit), once for the vowel, once for the last consonant.",
    introduction: "Say: 'Q always teams up with u to make the /kw/ sound. You will never see q without u. Say /kw/. Let's decode: qu-i-t → /kw/ /i/ /t/ → quit.' The letters qu act as one unit.",
    wordList: "quit,quip,quiz,quest,quell,quack,quaff,qualm,quart,queen,query,quick,quite,quote,quoth,aqua,equal,liquid,opaque,plaque",
    dictationWords: "quit,quip,quiz,quest,quick",
    tipsForParents: "Explain that q is one of the only letters that always needs a partner. This makes qu memorable. 'Q is never alone — it always brings its friend u.' Qui- = /kwi/, que- = /kwe/.",
  },
  {
    name: "z", category: "Stage 3", sequenceOrder: 21, stage: "3",
    heartWords: "was, are, you, they, said, have, of, do",
    examples: "zap,zip,zit,zag",
    warmup: "Bee buzz — z is the buzzy version of s. Say /s/ (no buzz), then /z/ (add buzz). Feel your throat: /s/ is quiet, /z/ buzzes. Buzz like a bee: zzzzz.",
    introduction: "Say: 'Z makes the /z/ sound — like a buzzing bee. Say /z/. Let's decode: z-a-p → /z/ /a/ /p/ → zap. Z appears at the start of words and sometimes at the end (fizz comes later with double z).'",
    wordList: "zap,zip,zit,zag,zinc,zero,zest,zone,zoom,zeal,fez,fuzz,fizz,jazz,quiz,raze,daze,gaze,haze,maze",
    dictationWords: "zap,zip,zit,zag,zinc",
    tipsForParents: "Z is relatively rare at the start of words. More commonly, the /z/ sound at the end of words is spelled with s (dogs, runs). Teach z as /z/ and note that 's' can also say /z/ — this helps with reading plurals.",
  },

  // ── Stage 4 — j u k x w ────────────────────────────────────
  {
    name: "j", category: "Stage 4", sequenceOrder: 22, stage: "4",
    heartWords: "come, some, one, two, here, there, where, were, her, for",
    examples: "jab,jig,jet,jot",
    warmup: "J bounce — say /j/ and feel your tongue tip spring off the roof of your mouth: /j/ /j/ /j/. It is a bouncy, voiced sound. Then blend: /j/-/e/-/t/ → jet.",
    introduction: "Say: 'J makes the /j/ sound — like a bouncy jump. Say /j/. Let's decode: j-e-t → /j/ /e/ /t/ → jet.' J always sounds /j/ at the start. At the end of a word the /j/ sound is spelled -ge or -dge (Stage 7).",
    wordList: "jab,jig,jet,jot,jug,jam,jab,jar,jaw,joy,job,jot,jot,jut,jade,jake,jest,jimp,join,jolt",
    dictationWords: "jab,jig,jet,jot,jug",
    tipsForParents: "J is fairly simple as an initial consonant. Note that words do not end in j (the /j/ at word endings = -ge or -dge). If she asks why 'age' says /j/, say 'Great spotting — ge at the end says /j/; we will learn more later.'",
  },
  {
    name: "u", category: "Stage 4", sequenceOrder: 23, stage: "4",
    heartWords: "come, some, one, two, here, there, were, here, her, for",
    examples: "up,us,under,until",
    warmup: "Short u stretch — say /u/ like a surprised uh. Stretch it: uuuu. Now find short u in: bug, cup, run, mud, fun, bud, dug. Raise your hand for each /u/ word.",
    introduction: "Say: 'Short u says /u/ — like a short surprised uh. Say /u/. It is the middle sound in bug and cup. Let's blend: b-u-g → /b/ /u/ /g/ → bug.'",
    wordList: "up,us,under,until,upon,bug,bun,bus,but,cup,cut,dug,fun,gun,gum,hug,jug,mud,mug,nut",
    dictationWords: "up,bug,cup,fun,mud",
    tipsForParents: "Short /u/ is one of the most neutral vowel sounds in English — it is the unstressed 'uh'. Children often confuse it with short /o/ (cup/cop). Point out mouth position: /u/ is more relaxed and central, /o/ has a rounder jaw.",
  },
  {
    name: "k", category: "Stage 4", sequenceOrder: 24, stage: "4",
    heartWords: "come, some, one, two, here, there, where, were, her, for",
    examples: "kit,kid,keg,kept",
    warmup: "K and c both make /k/ — practice: cat, kit, cob, king. Notice both are the same back-of-throat /k/ sound. K is used before e, i, y; c is used before a, o, u.",
    introduction: "Say: 'K makes the same /k/ sound as c. We use k before the letters e, i, and y. Say /k/. Let's decode: k-i-t → /k/ /i/ /t/ → kit.' Introduce the c vs k rule simply.",
    wordList: "kit,kid,keg,kept,king,kick,kind,keen,kelp,kelp,ask,elk,ink,irk,oak,silk,sulk,task,tusk,yak",
    dictationWords: "kit,kid,keg,king,kick",
    tipsForParents: "The c/k rule is: before e or i use k (kite, keep), before a, o, u use c (cat, cold, cut). Do not overteach this now — it will feel natural with exposure. For now just say 'k at the start of this word says /k/ just like c.'",
  },
  {
    name: "x", category: "Stage 4", sequenceOrder: 25, stage: "4",
    heartWords: "come, some, one, two, here, there, where, were, her, for",
    examples: "fox,box,mix,fix",
    warmup: "Double sound — x makes TWO sounds squeezed together: /k/ + /s/ = /ks/. Say /ks/ fast: /ks/. Now find it in: fox, box, mix, fix, six, wax, tax, hex.",
    introduction: "Say: 'X usually appears at the end of words and makes the /ks/ sound — two sounds together. Say /ks/. Let's decode: f-o-x → /f/ /o/ /ks/ → fox.' X at the start of a word often says /z/ (xylophone) but we focus on end-of-word x for now.",
    wordList: "fox,box,mix,fix,six,wax,tax,hex,flex,flux,next,text,vex,exam,axe,ox,ibex,index,lax,max",
    dictationWords: "fox,box,mix,fix,six",
    tipsForParents: "X is almost always at the end of short words. The /ks/ blend can be tricky — she may say just /k/ or just /s/. Say 'X is a lazy letter — it borrows two sounds: /k/ and /s/ squeezed together: /ks/.'",
  },
  {
    name: "w", category: "Stage 4", sequenceOrder: 26, stage: "4",
    heartWords: "come, some, one, two, here, there, where, were, her, for",
    examples: "wet,win,web,wok",
    warmup: "Lip round — make a small circle with your lips and say /w/. It starts with lip rounding then opens. Practice: /w/-/e/-/t/ → wet, /w/-/i/-/n/ → win. Compare with /v/: w rounds lips, v uses teeth.",
    introduction: "Say: 'W makes the /w/ sound — round your lips like a tiny circle then open. Say /w/. Let's decode: w-e-t → /w/ /e/ /t/ → wet.'",
    wordList: "wet,win,web,wok,wig,wag,wax,wed,wit,woe,bow,cow,dew,few,how,jaw,law,low,mow,new",
    dictationWords: "wet,win,web,wok,wig",
    tipsForParents: "W and v are often confused. W rounds the lips, v puts teeth to lip. Try 'wet' vs 'vet': w = lips round, v = teeth on lip. Also note that 'w' appears after vowels in words like cow, bow, low — where it helps form vowel teams.",
  },

  // ── Stage 4+ — Doubles & plurals ───────────────────────────
  {
    name: "ll · ss · ff · zz", category: "Stage 4+", sequenceOrder: 27, stage: "4+",
    heartWords: "what, that, with, this, then, when, which, all",
    examples: "bell,miss,off,jazz",
    warmup: "Double look — look at these words: bell, miss, off, buzz. What do you notice? Each has two of the same letter at the end! The double letter makes ONE sound — not two.",
    introduction: "Say: 'After a short vowel at the end of a one-syllable word, we often double the final l, s, f, or z. Say bell, miss, off, jazz. The double letters make one sound. This is called the FLOSS rule: F L S S — after a short vowel, double these.' Also introduce -s and -es plurals.",
    wordList: "bell,bill,bull,call,doll,fall,fill,full,gull,hall,hill,hull,ill,kill,mill,null,pill,pull,tall,tell,miss,boss,fuss,hiss,kiss,loss,mass,moss,pass,toss,off,cliff,cuff,huff,muff,puff,ruff,staff,stiff,stuff,jazz,fizz,buzz,fuzz,razz,whizz,cats,dogs,foxes,dishes,boxes",
    dictationWords: "bell,miss,off,jazz,cats",
    tipsForParents: "The FLOSS rule (double f, l, s after a short vowel) is a reliable spelling pattern. Teach: 'If a word ends in /f/, /l/, /s/, or /z/ sound after a short vowel — double it.' Also: plurals add -s (cats) or -es after s/sh/ch/x/z (boxes, dishes).",
  },

  // ── Stage 5 — Consonant blends + ck ───────────────────────
  {
    name: "End blends: -nd -nk -nt -mp -st", category: "Stage 5", sequenceOrder: 28, stage: "5",
    heartWords: "about, could, would, should, their, because, from, want",
    examples: "band,sink,tent,lamp",
    warmup: "End blend tap — say each word and tap out the sounds. Count: band = b-a-n-d (4 sounds). Do: sand, rink, tent, camp, best, belt, soft, help. Tap your fingers for each sound.",
    introduction: "Say: 'Sometimes two consonants sit together at the end of a word — we call these end blends. Each consonant keeps its own sound. Let me show you: b-a-n-d → /b/ /a/ /n/ /d/ → band. Each sound is clear, just blended fast.' Practice blending the final two consonants first, then add the vowel.",
    wordList: "band,sand,land,hand,bend,fond,bond,mend,rend,tend,wind,sink,rink,link,pink,bank,rank,sank,tank,tent,rent,dent,went,vent,lamp,camp,damp,ramp,best,rest,nest,test,vest,belt,felt,melt,welt,bolt,soft,loft,help,yelp,scalp,gulp",
    dictationWords: "band,sink,tent,lamp,best",
    tipsForParents: "End blends are often garbled — children drop one of the consonants (ban instead of band). Slow it down: 'I hear /b/ /a/ /n/ — what comes next? /d/. Now faster: band.' Finger-tapping each sound helps.",
  },
  {
    name: "L-blends: bl- cl- fl- gl- pl- sl-", category: "Stage 5", sequenceOrder: 29, stage: "5",
    heartWords: "about, could, would, should, their, because, from, want",
    examples: "blob,clap,flag,plan",
    warmup: "Blend chain — say the blend then add the vowel: bl+a = bla, cl+a = cla, fl+a = fla. Now add an ending: bl+a+g = blag. Do with each l-blend.",
    introduction: "Say: 'L-blends have two consonants at the start — both sounds must be heard. Say bl- as one quick /bl/: bl-o-b → blob. The trick is to blend the two consonants together first, then add the vowel.' Model each l-blend separately before reading words.",
    wordList: "blob,blot,blot,blast,blend,bless,blink,block,blood,blow,clam,clap,clan,clad,claw,clay,clip,clot,club,clump,flag,flat,flab,flan,flap,flaw,flea,flex,flip,flock,glad,glib,glob,gloss,glow,glue,plan,plod,plop,plot,plug,slap,slam,slim,slip,slob,slot,slug",
    dictationWords: "blob,clap,flag,glad,plan",
    tipsForParents: "L-blends are among the easier blends because /l/ is easy to see. Watch for 'buh-lob' instead of 'blob' — the blend should be tight, not two separate syllables. Model and have her repeat several times before reading from the list.",
  },
  {
    name: "R-blends: br- cr- dr- fr- gr- tr-", category: "Stage 5", sequenceOrder: 30, stage: "5",
    heartWords: "about, could, would, should, their, because, from, want",
    examples: "brat,crab,drip,frog",
    warmup: "R-blend tongue twist — say: br-cr-dr-fr-gr-tr as fast as you can. Now slow: brrr-crrr-drrr-frrr-grrr-trrr. Then add the vowel: bra, cra, dra, fra, gra, tra.",
    introduction: "Say: 'R-blends also have two consonants at the start — the r sound grows out of the first consonant. Say br-: /br/ (lips pop, then growl). Let's decode: cr-a-b → /kr/ /a/ /b/ → crab. Keep both consonants distinct but blended.'",
    wordList: "brat,brag,brad,brim,brisk,brow,crab,cram,crib,crop,cross,crew,drip,drag,drab,drift,drop,drum,frog,fret,from,grin,grip,grab,grub,grid,trip,trap,trim,trot,truck,tram",
    dictationWords: "brat,crab,drip,frog,trip",
    tipsForParents: "R-blends are harder than l-blends because /r/ has that growl quality. 'Frog' often becomes 'fwog' or 'fog'. Slow it down: f-r-o-g, each sound distinct. Practice the blend in isolation (fr, gr, tr) before adding the vowel.",
  },
  {
    name: "ck", category: "Stage 5", sequenceOrder: 31, stage: "5",
    heartWords: "about, could, would, should, their, because, from, want",
    examples: "back,deck,kick,lock",
    warmup: "Short vowel check — say: back, deck, kick, lock, duck. All have short vowels. Now say: take, beak — long vowels — no ck! Rule: short vowel + /k/ at the end = ck.",
    introduction: "Say: 'After a short vowel, we spell the /k/ sound at the end of a word with CK — not just c or k. The c and k together make one /k/ sound. d-u-ck → /d/ /u/ /k/ → duck.' Contrast: back (short a, use ck) vs bake (long a, use ke).",
    wordList: "back,deck,kick,lock,duck,black,brick,check,click,clock,crack,duck,flock,flick,frock,knock,knack,prick,quick,slack,smack,snack,speck,stack,stick,stock,stuck,thick,track,trick,truck,wreck",
    dictationWords: "back,deck,kick,lock,duck",
    tipsForParents: "The ck rule is: short vowel + /k/ at end = ck (back, neck, sick, lock, duck). Long vowel or vowel team + /k/ = ke or k (bike, book). This distinction helps with spelling. Point it out: 'Is the vowel short? Then we need ck.'",
  },
  {
    name: "Morphology: -ed past tense", category: "Stage 5", sequenceOrder: 32, stage: "5",
    heartWords: "about, could, would, should, their, because, from, want",
    examples: "jumped,hopped,filled,melted",
    warmup: "Yesterday game — 'Today I jump. Yesterday I ___.' Let her finish: jumped. Do: walk/walked, hop/hopped, fill/filled, melt/melted, drift/drifted.",
    introduction: "Say: '-ed is added to verbs to show something happened in the past. It has THREE sounds: /t/ (jumped), /d/ (filled), /id/ (melted). You do not need to memorise which — just listen: jumped says /t/, filled says /d/, melted says /id/.' Model all three sounds.",
    wordList: "jumped,jumped,hopped,filled,melted,drifted,planted,grabbed,tripped,clapped,helped,lifted,rented,blended,clamped,flipped,gripped,blasted,clicked,locked,kicked,flushed,crunched,marched,parked",
    dictationWords: "jumped,hopped,filled,melted,drifted",
    tipsForParents: "Children often struggle with -ed because it has three sounds (/t/, /d/, /id/). Do not teach the rule directly — develop the ear. 'Say jumped — is the ending /t/, /d/, or /id/?' Most children figure it out naturally through reading and rereading.",
  },
  {
    name: "S-blends: st- sp- sn- sm- sc- sk- sw-", category: "Stage 5", sequenceOrder: 33, stage: "5",
    heartWords: "about, could, would, should, their, because, from, want",
    examples: "stop,spin,snip,swim",
    warmup: "S-blend speed drill — say each blend 3 times fast: st-st-st, sp-sp-sp, sn-sn-sn, sm-sm-sm, sc-sc-sc, sk-sk-sk, sw-sw-sw. Then add the vowel: sto, spi, sna, sme, sca, ski, swi.",
    introduction: "Say: 'S-blends all start with /s/ then add another consonant. Both sounds must be heard: st- (stop), sp- (spin), sn- (snap), sm- (smog), sk- (skip), sw- (swim). Let me show you: st-o-p → /st/ /o/ /p/ → stop.'",
    wordList: "stop,stem,step,sting,stock,stamp,stand,stark,spell,spin,spit,spot,span,speck,speed,snip,snag,snap,snob,snub,smog,smug,smack,smell,smoke,scan,scab,scamp,skip,skill,skull,skid,swim,swift,swam,swamp,swept,swing",
    dictationWords: "stop,spin,snip,smog,swim",
    tipsForParents: "S-blends can sound like one continuous sound — 'st' merges into one smooth unit. That is correct! The goal is not two separate sounds but a smooth blend. Practise the blends in isolation first, then with vowels, then in words.",
  },

  // ── Stage 6 — sh ch tch th ng ph wh ───────────────────────
  {
    name: "sh", category: "Stage 6", sequenceOrder: 34, stage: "6",
    heartWords: "through, though, enough, thought, bought, after, every, other",
    examples: "ship,shop,fish,wish",
    warmup: "Shush game — put your finger to your lips and say shhhh. That is the /sh/ sound! Say: ship, shop, fish, wish. Say it again slowly and notice s+h make ONE new sound together.",
    introduction: "Say: 'When s and h sit together, they make ONE sound: /sh/ — like telling someone to be quiet. Say /sh/. Let's decode: sh-i-p → /sh/ /i/ /p/ → ship. S and h no longer say their individual sounds — together they say /sh/.'",
    wordList: "ship,shop,fish,wish,dish,shed,shelf,shell,shift,shin,brush,cash,clash,crash,crush,dash,flash,flesh,flush,fresh,gush,harsh,lash,marsh,mash,mesh,rash,rush,shack,shade,shame,shape,shark,sharp,slash,smash,splash,stash,trash,wash",
    dictationWords: "ship,fish,wish,shell,rush",
    tipsForParents: "SH is usually the first digraph children master. The key message: two letters, one sound. If she sounds out s then h separately, remind her: 'When s and h sit together they say /sh/ — they are best friends who make a new sound.' This applies to all digraphs.",
  },
  {
    name: "ch", category: "Stage 6", sequenceOrder: 35, stage: "6",
    heartWords: "through, though, enough, thought, bought, after, every, other",
    examples: "chip,chop,chin,rich",
    warmup: "Train sound — ch-ch-ch like a steam train! Feel how your tongue touches the top of your mouth: /ch/. Compare with /sh/ — sh is smooth, ch is a short sharp stop.",
    introduction: "Say: 'CH makes the /ch/ sound — like a sneezing train: ch! Say /ch/. Let's decode: ch-i-p → /ch/ /i/ /p/ → chip.' Note: ch has other sounds in borrowed words (school, chef) but /ch/ is most common.",
    wordList: "chip,chop,chin,rich,much,chest,champ,chill,chit,chuck,bench,branch,bunch,catch,church,clench,clinch,crunch,hatch,launch,lunch,march,match,munch,notch,patch,pinch,poach,punch,ranch,reach,scratch,sketch,starch,stretch,such,teach,torch,touch",
    dictationWords: "chip,chop,chin,bench,lunch",
    tipsForParents: "Compare sh and ch often — sh is smooth and continuous, ch has a stopping quality. If she confuses them, try: 'sh is hissing air, ch is a little puff/stop.' The physical difference is that ch is an affricate (stop + fricative) while sh is continuous.",
  },
  {
    name: "tch", category: "Stage 6", sequenceOrder: 36, stage: "6",
    heartWords: "through, though, enough, thought, bought, after, every, other",
    examples: "catch,match,fetch,witch",
    warmup: "Rule check — tch comes after a short vowel, just like ck. Say: catch, fetch, witch, notch, hutch. All have short vowels before tch. Say match → the a is short, then /ch/ spelled tch.",
    introduction: "Say: 'After a short vowel, we spell the /ch/ sound with TCH — three letters, one sound. ca-tch → /k/ /a/ /ch/ → catch. The t in tch does not make its own sound — it is part of the team.' Teach alongside ck: short vowel + /k/ = ck, short vowel + /ch/ = tch.",
    wordList: "catch,match,fetch,witch,notch,hutch,scratch,stretch,snatch,stitch,batch,blotch,botch,clutch,crutch,dispatch,Dutch,ditch,Dutch,etch,hatch,hitch,itch,latch,letch,lurch,patch,pitch,retch,sketch,switch,thatch,watch,wretch",
    dictationWords: "catch,match,fetch,witch,notch",
    tipsForParents: "Tch follows the same short-vowel rule as ck. Note the exceptions: much, such, which, rich, attach — in these words ch (not tch) follows the vowel. Teach the rule as the default: 'After a short vowel use tch, except in a handful of common words.'",
  },
  {
    name: "th", category: "Stage 6", sequenceOrder: 37, stage: "6",
    heartWords: "through, though, enough, thought, bought, after, every, other",
    examples: "this,that,them,with",
    warmup: "Tongue out — stick your tongue between your teeth and blow: /th/ (unvoiced, as in thin). Now add voice: /th/ (voiced, as in this). Feel the difference! Throat vibrates for voiced th.",
    introduction: "Say: 'TH makes two sounds: a quiet /th/ (thin, thank) and a louder buzzy /th/ (this, that, them). For both, your tongue lightly touches your top teeth. Say both: thin / this.' High-frequency function words (the, this, that, them, they, there, their, then) all use voiced th.",
    wordList: "this,that,them,with,then,the,bath,cloth,math,moth,path,teeth,think,third,thick,thin,thank,thud,theft,though,three,threw,throw,throat,throb,thrush,thumb,thump,thrust",
    dictationWords: "this,that,them,thin,bath",
    tipsForParents: "The most important th words are function words: the, this, that, them, they, their, there, then, though. These all use voiced /th/. Unvoiced /th/ appears in think, thank, three, thin. Both are common. Use the throat-touch trick to distinguish.",
  },
  {
    name: "ng", category: "Stage 6", sequenceOrder: 38, stage: "6",
    heartWords: "through, though, enough, thought, bought, after, every, other",
    examples: "ring,sing,king,song",
    warmup: "Back of throat nasal — say /ng/ and feel the back of your tongue pressing up: /ng/. It is like n but at the back. Hum: nnnng. Then say: ring, sing, king, bang.",
    introduction: "Say: 'NG makes one nasal sound at the back of your throat — like the end of ring or sing. Say /ng/. Let's look at: r-i-ng → /r/ /i/ /ng/ → ring. N and G together make ONE sound /ng/ — not /n/ + /g/.' Note: ng never starts a word in English.",
    wordList: "ring,sing,king,song,long,bang,hang,rang,gang,fang,cling,bring,fling,sting,string,strong,spring,swing,thing,wrong,along,among,belong,prong,throng",
    dictationWords: "ring,sing,song,bang,string",
    tipsForParents: "The /ng/ sound does not appear at the start of English words — only in the middle or at the end. Watch for children saying /n/ + /g/ separately (rin-g): 'ng is one sound — the back of your tongue goes up: /ng/.' Also note that nk = /ngk/ (thank, sink).",
  },
  {
    name: "ph", category: "Stage 6", sequenceOrder: 39, stage: "6",
    heartWords: "through, though, enough, thought, bought, after, every, other",
    examples: "phone,photo,graph,phrase",
    warmup: "Ph = f — say 'phone' using /f/: fone. They sound the same! Ph words mostly come from Greek. Practice: photo → foto, graph → graf, phrase → fraze.",
    introduction: "Say: 'PH makes the same /f/ sound as the letter f. We see ph in words that came from Greek — like phone, photo, graph. Say /f/. Let's decode: ph-o-ne → /f/ /ō/ /n/ → phone.' Note this is the first time they see a vowel pattern (o-e) — mention it briefly.",
    wordList: "phone,photo,graph,phrase,Phil,phon,phase,phew,phish,alpha,dolphin,elephant,nephew,orphan,phantom,pharmacy,pheasant,phenomenon,philosophy,trophy",
    dictationWords: "phone,graph,phrase,dolphin,elephant",
    tipsForParents: "PH is relatively easy to learn because it just sounds like f. The challenge is spelling: children write 'fone' instead of 'phone'. Explain: 'These words came from Greek, where ph was used. We keep that spelling.' High-frequency ph words: phone, photo, graph, alphabet.",
  },
  {
    name: "wh", category: "Stage 6", sequenceOrder: 40, stage: "6",
    heartWords: "through, though, enough, thought, bought, after, every, other",
    examples: "when,what,where,which",
    warmup: "Question starter — most wh- words ask questions: what, when, where, which, why, who, whose, whom. Play 20 questions using wh- starters only.",
    introduction: "Say: 'WH usually makes the /w/ sound — just like the letter w on its own. So when: /w/ /e/ /n/ → when. Let us decode: wh-e-n → /w/ /e/ /n/ → when.' Note: who and whose say /h/ (no w sound) — teach as sight words.",
    wordList: "when,what,where,which,while,white,whale,wheat,wheel,whether,whisper,whistle,why,whack,wham,whet,whiff,whim,whip,whirl,whisk,whiz,whoever,wholesale,whoop",
    dictationWords: "when,what,where,which,while",
    tipsForParents: "Wh words are extremely high frequency, especially the question words. Note that 'who', 'whose', 'whom', 'whole' say /h/ not /w/ — teach these as exceptions. 'Who, whose, whole say /h/ — the w is quiet in these ones.'",
  },

  // ── Stage 7 Unit 1 — Long vowel teams ─────────────────────
  {
    name: "ai · ay", category: "Stage 7 Unit 1", sequenceOrder: 41, stage: "7.1",
    heartWords: "people, many, again, different, number, great, between, own",
    examples: "rain,tail,play,stay",
    warmup: "Long a sorting — put words in two groups: short a (cat, sat) or long /ā/ (rain, play). Use: rain, cat, play, hat, sail, tan, day, man, wait, ran.",
    introduction: "Say: 'Long a can be spelled ai (in the middle of words) or ay (at the end). Both say /ā/ like your name. ai: r-ai-n → /r/ /ā/ /n/ → rain. ay: p-l-ay → /pl/ /ā/ → play. When you see ai or ay, say /ā/.'",
    wordList: "rain,tail,sail,mail,rail,nail,pail,wait,bait,brain,chain,claim,drain,grain,plain,snail,sprain,strain,trail,train,day,bay,clay,gay,hay,jay,lay,may,pay,play,pray,ray,say,spray,stay,stray,sway,tray,way",
    dictationWords: "rain,tail,play,stay,train",
    tipsForParents: "The ai/ay split is a position rule: ai appears in the middle of a syllable (rain, sail), ay appears at the end (day, play). Teach: 'If long /ā/ is at the end of a word, use ay; if it is in the middle, use ai.' This is a reliable spelling rule.",
  },
  {
    name: "ee · ea", category: "Stage 7 Unit 1", sequenceOrder: 42, stage: "7.1",
    heartWords: "people, many, again, different, number, great, between, own",
    examples: "feet,see,bean,read",
    warmup: "Long e sorting — short e (bed, pet) or long /ē/ (feet, bean)? Sort: feet, bed, see, pet, bean, red, read, men, tree, ten.",
    introduction: "Say: 'Long e can be spelled ee or ea. Both say /ē/ like the word me. ee: f-ee-t → /f/ /ē/ /t/ → feet. ea: b-ea-n → /b/ /ē/ /n/ → bean. When you see ee or ea, try /ē/ first.'",
    wordList: "feet,see,tree,green,street,bee,feed,feel,free,meet,need,peel,seed,seek,seem,sheep,sleep,speed,steel,sweep,bean,clean,cream,dream,each,eat,feast,heat,lean,lead,leaf,meal,mean,neat,peach,reach,read,real,seal,teach",
    dictationWords: "feet,tree,bean,dream,teach",
    tipsForParents: "Note that ea has alternative pronunciations: bread, head, steak, great. For now teach /ē/ as the default. When she encounters bread say 'Some ea words say short /e/ — bread is one of them; we learn these as we go.' Do not front-load the exceptions.",
  },
  {
    name: "--y · eigh · ey", category: "Stage 7 Unit 1", sequenceOrder: 43, stage: "7.1",
    heartWords: "people, many, again, different, number, great, between, own",
    examples: "funny,baby,eight,they",
    warmup: "Word-end y — read these and decide: does y say /ē/ or /ī/? funny, fly, baby, sky, candy, cry, happy, dry, party, try. Two-syllable words ending in y = /ē/. One-syllable = /ī/.",
    introduction: "Say: 'Y at the end of a multi-syllable word usually says /ē/ (funny, baby, happy). Y at the end of a one-syllable word says /ī/ (fly, sky, try). Eigh and ey both say /ā/ (eight, they, grey).' Teach each pattern with examples.",
    wordList: "funny,baby,happy,candy,party,story,very,every,lady,puppy,family,city,body,copy,angry,belly,bunny,carry,cherry,cloudy,eight,eighty,weight,freight,neighbor,sleigh,they,grey,obey,prey,survey,convey,hey,whey",
    dictationWords: "funny,happy,baby,eight,they",
    tipsForParents: "The two-syllable y rule (/ē/) is very helpful for reading. Teach: 'If y is at the end of a word and there are two syllables (a word with two beats), it says /ē/.' The exceptions (eigh, ey) are less common but appear in high-frequency words like eight, they, grey.",
  },
  {
    name: "igh · -y", category: "Stage 7 Unit 1", sequenceOrder: 44, stage: "7.1",
    heartWords: "people, many, again, different, number, great, between, own",
    examples: "night,light,fly,sky",
    warmup: "Long i family — these all say /ī/: night, fly, mine, pie. Sort them by spelling: igh words, y words, other. Add more: high, cry, fight, by, right, try, bright, dry.",
    introduction: "Say: 'Long i can be spelled igh (night, light, fight) or y at the end of a one-syllable word (fly, sky, cry). Both say /ī/. n-igh-t → /n/ /ī/ /t/ → night. fl-y → /fl/ /ī/ → fly.' The gh in igh is silent.",
    wordList: "night,light,fight,right,bright,flight,fright,knight,might,sight,slight,tight,high,nigh,sigh,thigh,my,by,fly,sky,dry,try,cry,fry,pry,shy,sly,spy,sty,why",
    dictationWords: "night,light,fly,sky,bright",
    tipsForParents: "The -igh spelling is a common source of confusion. Note the silent gh: 'The gh in -ight and -igh is always silent — just say /ī/.' Compare: night/nite, light/lite — the -igh spelling is standard.",
  },
  {
    name: "ie", category: "Stage 7 Unit 1", sequenceOrder: 45, stage: "7.1",
    heartWords: "people, many, again, different, number, great, between, own",
    examples: "pie,tie,lie,die",
    warmup: "Ie words — read: pie, tie, lie, die. What sound does ie make? /ī/. Now read: tried, cried, flies, dried, fried — ie still says /ī/ even when the word is longer.",
    introduction: "Say: 'IE at the end of a short word makes the /ī/ sound: pie, tie, lie. When we add an ending (like -ed or -s) the ie changes to y (tried, flies) — but the vowel sound stays /ī/.' Focus on the base word pattern for now.",
    wordList: "pie,tie,lie,die,hie,vie,tried,cried,flies,dried,fried,spied,supplies,replied,applied,amplified,beautified,certified,classified,denied",
    dictationWords: "pie,tie,lie,tried,cried",
    tipsForParents: "When adding -ed or -s to words ending in ie or y (fly → flies, try → tried), the y changes to i. This is the 'y changes to i' rule — do not teach the mechanics yet, just note the pattern when you see it. 'Fly becomes flies — the y changed to i before the ending.'",
  },
  {
    name: "oa", category: "Stage 7 Unit 1", sequenceOrder: 46, stage: "7.1",
    heartWords: "people, many, again, different, number, great, between, own",
    examples: "boat,coat,road,toad",
    warmup: "Long o family — these say /ō/: boat, coat, road, home. OA appears in the middle of a word. List more oa words: toast, float, soap, goal.",
    introduction: "Say: 'OA says /ō/ — the long o sound. It usually appears in the middle of a word. b-oa-t → /b/ /ō/ /t/ → boat. When you see oa, say /ō/.' Compare with 'ow' at the end (show, know) — both say /ō/ but different positions.",
    wordList: "boat,coat,road,toad,toast,float,groan,coach,approach,boast,soak,foam,cloak,coax,croak,goat,loaf,loan,moan,moat,oak,oat,poach,roam,roast,throat,toadstool",
    dictationWords: "boat,coat,road,toast,float",
    tipsForParents: "OA usually appears in the middle of a syllable. At the end of a word, long /ō/ is typically spelled 'ow' (show, blow) or 'o-e' (home). Teach: 'oa in the middle = /ō/. We will learn the end-of-word /ō/ spellings in Stage 7.4.'",
  },
  {
    name: "Morphology: -ing + doubling rule", category: "Stage 7 Unit 1", sequenceOrder: 47, stage: "7.1",
    heartWords: "people, many, again, different, number, great, between, own",
    examples: "running,sitting,jumping,reading",
    warmup: "Adding -ing — add -ing to: jump, sit, run, hop, read. Which ones need a double letter? jump → jumping (no double), sit → sitting (double t), run → running (double n).",
    introduction: "Say: '-ING is added to verbs to show something is happening now. For most words: just add -ing (jump → jumping, read → reading). But if the word ends in a short vowel + single consonant: double the consonant first (sit → sitting, run → running, hop → hopping). This is the doubling rule.'",
    wordList: "running,sitting,hopping,swimming,getting,beginning,forgetting,planning,stopping,dropping,jumping,reading,eating,sleeping,playing,raining,singing,teaching,reaching,floating",
    dictationWords: "running,sitting,jumping,reading,playing",
    tipsForParents: "The doubling rule applies when: (1) the base word has one syllable, (2) one short vowel, (3) one final consonant. Then double the consonant before -ing (or -ed, -er). 'Short vowel + one consonant = double it: sit → sitting.' Long vowel words just add -ing: sleep → sleeping.",
  },
  {
    name: "un- prefix · contractions", category: "Stage 7 Unit 1", sequenceOrder: 48, stage: "7.1",
    heartWords: "people, many, again, different, number, great, between, own",
    examples: "undo,untie,unlock,don't",
    warmup: "Un- means not — undo the opposite of do. What is the un- word for: happy, fair, tidy, lock, pack, zip, fold, tie? Make un- words.",
    introduction: "Say: 'UN- is a prefix — it goes at the start of a word and means not or the opposite. un + happy = unhappy (not happy). un + lock = unlock (reverse of lock). Also today: contractions. Do + not = don't. Can + not = can't. An apostrophe replaces the missing letters.'",
    wordList: "undo,untie,unlock,unhappy,unfair,unpack,unzip,unfold,unclear,unsafe,unkind,unlike,unwell,unfit,don't,can't,won't,isn't,didn't,wouldn't,couldn't,shouldn't,haven't,hadn't,wasn't,weren't,I'm,I'll,I've,he's",
    dictationWords: "unlock,unhappy,don't,can't,won't",
    tipsForParents: "The un- prefix is highly productive — it generates many new words. After teaching it, point out un- words in books she reads. For contractions, show the apostrophe clearly: 'The little mark stands in for the missing letter(s): can + not → can't.'",
  },

  // ── Stage 7 Unit 2 — R-controlled vowels ──────────────────
  {
    name: "ar · a · al", category: "Stage 7 Unit 2", sequenceOrder: 49, stage: "7.2",
    heartWords: "world, work, word, bird, early, learn, heard, earth",
    examples: "car,star,farm,start",
    warmup: "Ar sound hunt — find the /ar/ sound in: car, star, bark, part, farm. Now say them slowly: c-ar, st-ar, b-ar-k. The ar pattern says /ar/.",
    introduction: "Say: 'When a is followed by r, the vowel sound changes to /ar/ — like in car and star. c-ar → /k/ /ar/ → car. We also hear /ar/ in some words with just a (bath, path in some accents) and al (calm, palm, half). The r changes the vowel sound.'",
    wordList: "car,star,farm,start,hard,bark,card,dark,harm,jar,large,mark,park,part,scarf,shark,sharp,snarl,spark,yard,bath,path,class,glass,grass,last,past,calm,palm,half,calf,talk,walk,chalk",
    dictationWords: "car,star,farm,dark,park",
    tipsForParents: "The r after a vowel changes the vowel sound — this is called an r-controlled vowel. The ar pattern is the most common and usually consistent. Note: in some Australian/British accents, words like bath and grass also have the /ar/ sound (broad a).",
  },
  {
    name: "or · aw · ore · our · al", category: "Stage 7 Unit 2", sequenceOrder: 50, stage: "7.2",
    heartWords: "world, work, word, bird, early, learn, heard, earth",
    examples: "for,born,saw,more",
    warmup: "Or sound family — these all say /or/: for, saw, more, four, ball. Say each slowly: f-or, s-aw, m-or-e, f-our, b-all. Different spellings, same sound.",
    introduction: "Say: 'The /or/ sound has many spellings: or (for, born), aw (saw, draw), ore (more, store), our (four, pour), and al before some consonants (ball, tall, call). They all say /or/.' Focus first on or and aw as most common.",
    wordList: "for,born,more,store,before,saw,draw,jaw,claw,four,pour,court,ball,tall,call,fall,hall,mall,stall,wall,chalk,walk,talk,stalk,fort,horn,morning,normal,short,sort,sport,storm,torn,torch,worn",
    dictationWords: "for,born,saw,more,ball",
    tipsForParents: "The /or/ sound has many spelling patterns — this can be overwhelming. Focus on or and aw first, then expand. Teach: 'When you see or, aw, or ore, say /or/.' The al and our patterns are exceptions that appear in high-frequency words (ball, four).",
  },
  {
    name: "ir · ur · er", category: "Stage 7 Unit 2", sequenceOrder: 51, stage: "7.2",
    heartWords: "world, work, word, bird, early, learn, heard, earth",
    examples: "bird,first,hurt,burn",
    warmup: "Er family — say: bird, hurt, her, turn, first. What sound do they all share? /er/. Different spellings: ir (bird), ur (hurt), er (her). They all say the same sound.",
    introduction: "Say: 'The /er/ sound can be spelled ir (bird, first, girl), ur (hurt, turn, burn), or er (her, term, fern). All three spell the same /er/ sound. b-ir-d → /b/ /er/ /d/ → bird.' For spelling: ir is most common in the middle of a word, er often at the end.",
    wordList: "bird,first,girl,shirt,stir,birth,circle,circus,dirt,firm,girdle,squirt,third,thirst,whirl,hurt,turn,burn,surf,fur,blur,burst,church,curl,curse,curve,purse,turkey,urban,her,term,fern,serve,verb,nerve,stern,expert",
    dictationWords: "bird,first,hurt,turn,her",
    tipsForParents: "The three spellings of /er/ (ir, ur, er) are a notorious spelling challenge. For reading: all say /er/, so decoding is easy. For spelling: ir tends to appear after consonants in the middle of a root word (bird, first), ur after vowel blends, er at the end (teacher, faster). Teach patterns gradually.",
  },
  {
    name: "air · are · ere", category: "Stage 7 Unit 2", sequenceOrder: 52, stage: "7.2",
    heartWords: "world, work, word, bird, early, learn, heard, earth",
    examples: "fair,hair,care,share",
    warmup: "Air sound family — say: fair, care, there. What sound do they share? /air/. Spellings: air (fair, chair), are (care, share), ere (there, where). All say /air/.",
    introduction: "Say: 'The /air/ sound can be spelled air (fair, chair, pair), are (care, share, dare), or ere (there, where). They all say /air/. f-air → /f/ /air/ → fair. c-are → /k/ /air/ → care.' High frequency words like there and where use ere.",
    wordList: "fair,hair,chair,pair,stair,flair,air,care,share,dare,spare,flare,glare,snare,square,stare,ware,bare,compare,declare,there,where,everywhere,nowhere,elsewhere",
    dictationWords: "fair,hair,care,share,there",
    tipsForParents: "There/their/they're is a classic confusion point. Teach the /air/ sound pattern in 'there' but note that 'their' (belonging to them) and 'they're' (they are) sound the same but have different spellings. Introduce them as a tricky trio when they appear in reading.",
  },
  {
    name: "Morphology: -er comparative", category: "Stage 7 Unit 2", sequenceOrder: 53, stage: "7.2",
    heartWords: "world, work, word, bird, early, learn, heard, earth",
    examples: "bigger,faster,smaller,louder",
    warmup: "Comparison game — I am tall. She is ___ (taller). This box is heavy. That one is ___ (heavier). Make comparisons using -er.",
    introduction: "Say: '-ER added to adjectives means more — faster means more fast. tall → taller, fast → faster, small → smaller, loud → louder. Remember the doubling rule (big → bigger) and the y to i rule (happy → happier). The -er suffix has the /er/ sound — just like bird and hurt.'",
    wordList: "bigger,faster,smaller,louder,quieter,stranger,lighter,heavier,hungrier,friendlier,happier,angrier,easier,busier,bolder,braver,cheaper,cleaner,cleverer,closer",
    dictationWords: "bigger,faster,smaller,louder,happier",
    tipsForParents: "Point out that -er appears in two roles: as a comparative adjective (bigger) and as an agent noun (teacher, farmer — the one who does). Both are very common and both say /er/. This reinforces the r-controlled vowel pattern from this stage.",
  },

  // ── Stage 7 Unit 3 — Diphthongs & oo sounds ───────────────
  {
    name: "oo · ou · o (long)", category: "Stage 7 Unit 3", sequenceOrder: 54, stage: "7.3",
    heartWords: "should, would, could, through, whose, move, prove, group",
    examples: "moon,pool,soup,rule",
    warmup: "Long oo hunt — find the /oo/ sound: moon, food, soup, do, who, rule, blue. Different spellings, same sound: oo, ou, o, u-e, ue.",
    introduction: "Say: 'The long /oo/ sound has many spellings. Most common: oo (moon, pool, food). Also: ou (soup, group), o (do, to, who), and others we will learn soon. m-oo-n → /m/ /oo/ /n/ → moon. When you see oo, try the long /oo/ sound first.'",
    wordList: "moon,pool,food,room,cool,fool,hoop,hoot,loom,loop,mood,moor,noon,poof,roof,root,scoop,shoot,spool,swoop,soup,group,youth,through,wound,route,you,do,to,who,shoe,two,move,prove,tomb",
    dictationWords: "moon,pool,food,soup,group",
    tipsForParents: "Long /oo/ is one of the most common vowel sounds in English and it has many spellings. Teach oo as the primary spelling first. When she encounters others (through, you, do) teach them as additional spellings: 'These all say /oo/ — it is just written differently.'",
  },
  {
    name: "ow · ou (diphthong)", category: "Stage 7 Unit 3", sequenceOrder: 55, stage: "7.3",
    heartWords: "should, would, could, through, whose, move, prove, group",
    examples: "cow,how,out,shout",
    warmup: "Ouch sound — say 'ouch' and listen for the /ow/ diphthong — your mouth slides from /a/ to /oo/. Find /ow/ in: cow, how, out, shout, brown, cloud.",
    introduction: "Say: 'The /ow/ sound can be spelled ow (cow, how, brown) or ou (out, shout, cloud, found). Both spellings make the same sliding /ow/ sound. c-ow → /k/ /ow/ → cow. sh-ou-t → /sh/ /ow/ /t/ → shout.' Note: ow also says /ō/ (show, know) — context helps.",
    wordList: "cow,now,how,town,brown,crown,down,frown,gown,growl,howl,owl,plow,pow,prowl,scowl,vow,wow,out,shout,found,ground,cloud,proud,about,bound,count,doubt,flour,mount,mouth,round,sound,south,sprout",
    dictationWords: "cow,town,out,shout,cloud",
    tipsForParents: "ow has two sounds: /ow/ (cow, now) and /ō/ (show, snow). The /ow/ sound is more common in simple words, /ō/ is common in end-of-word position. When she misreads, say 'Try the other ow sound.' This position awareness develops naturally with reading experience.",
  },
  {
    name: "oi · oy", category: "Stage 7 Unit 3", sequenceOrder: 56, stage: "7.3",
    heartWords: "should, would, could, through, whose, move, prove, group",
    examples: "oil,coin,boy,joy",
    warmup: "Oink-oy — say /oi/ and listen for the sliding sound: mouth starts at /o/ and slides to /i/. Find /oi/ in: oil, coin, boy, joy, noise, voice. Which spelling do you see?",
    introduction: "Say: 'The /oi/ sound is spelled oi in the middle of words (oil, coin, voice) and oy at the end (boy, joy, enjoy). They sound the same. c-oi-n → /k/ /oi/ /n/ → coin. b-oy → /b/ /oi/ → boy.' Same position rule as ai/ay: middle = oi, end = oy.",
    wordList: "oil,coin,join,point,voice,choice,noise,moist,joint,foil,broil,coil,hoist,joist,moist,spoil,toil,boy,toy,joy,enjoy,annoy,destroy,royal,loyal,oyster,voyage,buoy,decoy,ploy,coy,deploy,employ",
    dictationWords: "oil,coin,voice,boy,joy",
    tipsForParents: "The oi/oy position rule is the same as ai/ay: use oi in the middle of a syllable (coin, oil, voice), use oy at the end (boy, joy, destroy). Teach this rule for spelling. For reading, both spellings are clear once the /oi/ sound is known.",
  },
  {
    name: "oo · u · oul (short oo)", category: "Stage 7 Unit 3", sequenceOrder: 57, stage: "7.3",
    heartWords: "should, would, could, through, whose, move, prove, group",
    examples: "book,look,put,could",
    warmup: "Short oo vs long oo — say: book / moon, look / pool, good / food, foot / root. Can you hear the difference? Short oo is tighter and shorter.",
    introduction: "Say: 'OO can say a shorter /oo/ sound (like book, look, good) as well as the long /oo/ sound (moon, pool). Also: u in some words says short /oo/ (put, push, full, bull). And oul in could, would, should says /ood/. Try: b-oo-k → /b/ /oo/ /k/ → book.'",
    wordList: "book,look,cook,took,good,foot,wood,hood,hook,nook,rook,shook,soot,stood,wool,put,push,pull,full,bull,bush,cushion,pudding,sugar,could,would,should,boulder,shoulder,smoulder",
    dictationWords: "book,look,good,put,could",
    tipsForParents: "The two oo sounds (moon vs book) are a common decoding challenge. Teach: 'Try long oo first. If it does not make a real word, try short oo.' This strategy resolves most cases. 'Book' with long oo = 'boo-k' — not a word. Switch to short oo = book. ✓",
  },

  // ── Stage 7 Unit 4 — Split digraphs & silent letters ──────
  {
    name: "a-e · a (magic e)", category: "Stage 7 Unit 4", sequenceOrder: 58, stage: "7.4",
    heartWords: "beautiful, because, friend, once, where, whole, write, answer",
    examples: "cake,make,name,came",
    warmup: "Magic e — add e to the end: cap → cape, can → cane, hat → hate, kit → kite, hop → hope. What happened to the vowel? It said its name!",
    introduction: "Say: 'When a silent e sits at the end of a word, it makes the vowel before it say its long name. a-e says /ā/: c-a-ke → /k/ /ā/ /k/ → cake. The e is silent but it works magic on the vowel. Compare: cap/cape, man/mane, hat/hate.'",
    wordList: "cake,make,name,came,late,gate,date,fate,hate,lake,lane,mane,made,male,pale,pale,rake,rate,safe,sale,same,table,label,paper,station,famous,baby,lady,acorn,apron,bacon,navy,staple,cradle",
    dictationWords: "cake,make,name,came,late",
    tipsForParents: "The magic e concept is a great insight. Make it concrete: write 'cap' then add e and watch the short a become long. 'The e at the end has magic powers — it reaches back and changes the vowel.' Be aware that many common words (have, live, give) are exceptions to this rule.",
  },
  {
    name: "i-e · soft c/g", category: "Stage 7 Unit 4", sequenceOrder: 59, stage: "7.4",
    heartWords: "beautiful, because, friend, once, where, whole, write, answer",
    examples: "ice,nice,mice,city",
    warmup: "Soft c and g — when c or g comes before e, i, or y, it usually says a soft sound: c → /s/ (city, cent, cycle), g → /j/ (giant, gym, gem). Say: city, giant, cycle, gem.",
    introduction: "Say: 'I-e says /ī/ (ice, nice, kite). Also today: soft c and g. C before e, i, or y says /s/: city says /s/; before a, o, u it says /k/: cat. G before e, i, or y says /j/: giant; before a, o, u it says /g/: got. i-ce → /ī/ /s/ → ice.'",
    wordList: "ice,nice,mice,rice,dice,price,slice,spice,twice,city,cent,cycle,circus,pencil,decide,excited,replace,face,pace,race,space,trace,giant,giraffe,gym,gem,gel,gentle,general,gerbil,magic,age,page,cage,stage,badge,huge",
    dictationWords: "ice,nice,city,cent,giant",
    tipsForParents: "Soft c and soft g are context-dependent: before e, i, y they say /s/ and /j/. This is why we have both 'cat' (hard c) and 'city' (soft c). Teach as a rule: 'If c or g comes before e, i, or y, it usually says its soft sound.' This is very reliable in English.",
  },
  {
    name: "e-e · e (magic e for /ē/)", category: "Stage 7 Unit 4", sequenceOrder: 60, stage: "7.4",
    heartWords: "beautiful, because, friend, once, where, whole, write, answer",
    examples: "these,theme,here,eve",
    warmup: "Long e with magic e — e-e is less common but important. Say: these, theme, here, eve. The first e says /ē/, the last e is silent magic e.",
    introduction: "Say: 'E-e says /ē/ — the first e says its name, the last e is silent. these → /th/ /ē/ /z/ → these. Also: many two-syllable words have e in an open syllable saying /ē/: Peter, secret, even, zero. The open syllable (ending in a vowel) lets the vowel say its name.'",
    wordList: "these,theme,here,eve,scheme,scene,complete,concrete,compete,delete,extreme,athlete,centimetre,Peter,legal,secret,even,zero,medium,equal,female,recent,prefix,sequence,species,vehicle",
    dictationWords: "these,theme,here,even,secret",
    tipsForParents: "E-e as a split digraph is less common than a-e or i-e but important for words like 'these', 'theme', 'concrete'. Open syllable /ē/ (the, e at the end of an open syllable) is very common in multisyllabic words. Teach: 'If an e is at the end of a syllable with nothing after it, it often says /ē/.'",
  },
  {
    name: "o-e · o · ow · oe", category: "Stage 7 Unit 4", sequenceOrder: 61, stage: "7.4",
    heartWords: "beautiful, because, friend, once, where, whole, write, answer",
    examples: "home,note,go,low",
    warmup: "Long o family — these all say /ō/: home, go, low, toe, boat (already learned). Today focus on o-e, o, ow, oe. Sort: home, go, show, toe, open, slow, bone, foe.",
    introduction: "Say: 'Long /ō/ has many spellings. o-e (home, bone, note), open syllable o (go, no, so, open), ow at end (show, blow, snow), and oe (toe, foe, goes). h-o-me → /h/ /ō/ /m/ → home. g-o → /g/ /ō/ → go. sh-ow → /sh/ /ō/ → show.'",
    wordList: "home,note,hope,stone,those,bone,code,cone,dote,dome,drove,globe,hole,joke,lone,mode,mole,nose,pole,rose,smoke,spoke,stove,tone,vote,woke,go,no,so,both,most,cold,old,bold,host,low,show,know,blow,flow,glow,grow,snow,throw,toe,foe,goes,does,hoe,oboe,woe",
    dictationWords: "home,note,go,show,toe",
    tipsForParents: "Long /ō/ consolidates several spelling patterns. The most important are: o-e (home), open syllable o (go, open), and ow at end (show, snow). Note: ow also says /ow/ (cow) — position helps. End of word after a consonant: usually /ō/ (show, snow, blow).",
  },
  {
    name: "kn · gn · mb · wr", category: "Stage 7 Unit 4", sequenceOrder: 62, stage: "7.4",
    heartWords: "beautiful, because, friend, once, where, whole, write, answer",
    examples: "knot,know,gnaw,lamb",
    warmup: "Silent letters — these words have a letter you cannot hear: knot (silent k), gnaw (silent g), lamb (silent b), write (silent w). Find the silent letter in: knock, sign, climb, wrap.",
    introduction: "Say: 'Some letter combinations have a silent letter. kn says /n/ (knot, know, knight), gn says /n/ (gnaw, sign), mb says /m/ (lamb, comb, climb), wr says /r/ (write, wrap, wrist). The first letter is silent. k-n-ot → /n/ /o/ /t/ → knot.'",
    wordList: "knot,know,knife,knock,knee,knight,kneel,knack,knave,knit,gnaw,gnat,sign,gnome,gnarled,lamb,climb,comb,bomb,thumb,dumb,numb,crumb,plumb,write,wrap,wrong,wrist,wren,wreck,wrestle,wraith",
    dictationWords: "knot,know,gnaw,lamb,write",
    tipsForParents: "Silent letters are a spelling challenge — she may write 'nife' for knife. Teach the patterns: 'k is silent before n (kn = /n/), g is silent before n (gn = /n/), b is silent after m (mb = /m/), w is silent before r (wr = /r/).' These patterns are consistent and learnable.",
  },
  {
    name: "u-e · ue · ew · ui", category: "Stage 7 Unit 4", sequenceOrder: 63, stage: "7.4",
    heartWords: "beautiful, because, friend, once, where, whole, write, answer",
    examples: "use,blue,new,fruit",
    warmup: "Long u family — these say /yoo/ or /oo/: use, blue, new, fruit. Sort by spelling: u-e (cute), ue (blue), ew (new), ui (fruit). Both /yoo/ and /oo/ readings are correct for many words.",
    introduction: "Say: 'Long u has several spellings: u-e (use, cute, mute), ue (blue, true, clue), ew (new, few, dew), ui (fruit, suit, juice). After some consonants the u says /yoo/ (use, cute), after others it says /oo/ (blue, fruit). u-se → /y/ /oo/ /z/ → use. bl-ue → /bl/ /oo/ → blue.'",
    wordList: "use,cute,mute,tune,fuse,cube,dune,flute,huge,mule,pure,rude,rule,tube,blue,true,clue,glue,sue,due,hue,argue,rescue,value,new,few,dew,stew,blew,brew,chew,crew,drew,flew,grew,knew,threw,fruit,suit,juice,bruise,cruise,sluice",
    dictationWords: "use,cute,blue,new,fruit",
    tipsForParents: "The /yoo/ vs /oo/ distinction in 'long u' often resolves itself — after l, r, j, sh the /y/ glide is dropped (blue, rule, June). After other consonants it is kept (cute, use, huge). Do not overteach this — natural exposure in reading builds the pattern. Focus on recognising the spellings (u-e, ue, ew, ui) and saying /oo/ or /yoo/.",
  },
];

// ─────────────────────────────────────────────────────────────
// RESOURCES — Pip and Tim books + general resources
// ─────────────────────────────────────────────────────────────

type ResourceRow = {
  name: string;
  url: string;
  description: string;
  type: string;
  isFree: number;
  stageMin: string;
  stageMax: string;
};

const RESOURCES: ResourceRow[] = [
  // Pip and Tim — Little Learners Love Literacy® decodable readers
  {
    name: "Pip and Tim — Stage 1",
    url: "https://www.littlelearnersloveliteracy.com.au/products/pip-and-tim-stage-1",
    description: "LLLL decodable readers for Stage 1. Covers m, s, f, a, p, t, c, i with Stage 1 heart words. Designed to be fully decodable from lesson one.",
    type: "book", isFree: 0, stageMin: "1", stageMax: "1",
  },
  {
    name: "Pip and Tim — Stage 2",
    url: "https://www.littlelearnersloveliteracy.com.au/products/pip-and-tim-stage-2",
    description: "LLLL decodable readers for Stage 2. Covers b, h, n, o, d, g, l, v. Consolidates Stage 1 sounds alongside new Stage 2 letters.",
    type: "book", isFree: 0, stageMin: "2", stageMax: "2",
  },
  {
    name: "Pip and Tim — Stage 3",
    url: "https://www.littlelearnersloveliteracy.com.au/products/pip-and-tim-stage-3",
    description: "LLLL decodable readers for Stage 3. Covers y, r, e, qu, z. Heart words: he, to, was, we, she.",
    type: "book", isFree: 0, stageMin: "3", stageMax: "3",
  },
  {
    name: "Pip and Tim — Stage 4",
    url: "https://www.littlelearnersloveliteracy.com.au/products/pip-and-tim-stage-4",
    description: "LLLL decodable readers for Stage 4. Covers j, u, k, x, w. Heart words: of, are, too, for, her.",
    type: "book", isFree: 0, stageMin: "4", stageMax: "4",
  },
  {
    name: "Pip and Tim — Stage 4+",
    url: "https://www.littlelearnersloveliteracy.com.au/products/pip-and-tim-stage-4-plus",
    description: "LLLL decodable readers for Stage 4+. Covers double letters (ll, ss, ff, zz), plurals, and the word 'a' as a standalone word.",
    type: "book", isFree: 0, stageMin: "4+", stageMax: "4+",
  },
  {
    name: "Pip and Tim — Stage 5",
    url: "https://www.littlelearnersloveliteracy.com.au/products/pip-and-tim-stage-5",
    description: "LLLL decodable readers for Stage 5. Covers adjacent consonants (CVCC, CCVC, CCVCC) and ck digraph.",
    type: "book", isFree: 0, stageMin: "5", stageMax: "5",
  },
  {
    name: "Pip and Tim — Stage 6",
    url: "https://www.littlelearnersloveliteracy.com.au/products/pip-and-tim-stage-6",
    description: "LLLL decodable readers for Stage 6. Covers consonant digraphs: sh, ch, tch, th, ng, ph, wh.",
    type: "book", isFree: 0, stageMin: "6", stageMax: "6",
  },
  {
    name: "Pip and Tim — Stage 7 Unit 1",
    url: "https://www.littlelearnersloveliteracy.com.au/products/pip-and-tim-stage-7-unit-1",
    description: "LLLL decodable readers for Stage 7 Unit 1. Covers long vowel teams: ai, ay, ee, ea, igh, -y, ie, oa, and the -ing morpheme.",
    type: "book", isFree: 0, stageMin: "7.1", stageMax: "7.1",
  },
  {
    name: "Pip and Tim — Stage 7 Unit 2",
    url: "https://www.littlelearnersloveliteracy.com.au/products/pip-and-tim-stage-7-unit-2",
    description: "LLLL decodable readers for Stage 7 Unit 2. Covers r-controlled vowels: ar, or, aw, ir, ur, er, air and the -er comparative morpheme.",
    type: "book", isFree: 0, stageMin: "7.2", stageMax: "7.2",
  },
  {
    name: "Pip and Tim — Stage 7 Unit 3",
    url: "https://www.littlelearnersloveliteracy.com.au/products/pip-and-tim-stage-7-unit-3",
    description: "LLLL decodable readers for Stage 7 Unit 3. Covers diphthongs and oo sounds: long oo, ow/ou, oi/oy, short oo.",
    type: "book", isFree: 0, stageMin: "7.3", stageMax: "7.3",
  },
  {
    name: "Pip and Tim — Stage 7 Unit 4",
    url: "https://www.littlelearnersloveliteracy.com.au/products/pip-and-tim-stage-7-unit-4",
    description: "LLLL decodable readers for Stage 7 Unit 4. Covers split digraphs (a-e, i-e, o-e, u-e), soft c/g, and silent letters (kn, gn, mb, wr).",
    type: "book", isFree: 0, stageMin: "7.4", stageMax: "7.4",
  },
  {
    name: "Pip and Tim — Stages 1–6 Value Pack",
    url: "https://www.littlelearnersloveliteracy.com.au/products/pip-and-tim-little-book-pack-stages-1-6",
    description: "Complete Pip and Tim decodable reader set for Stages 1–6. Best value for Foundation year families.",
    type: "book", isFree: 0, stageMin: "1", stageMax: "6",
  },
  // General resources updated with stage fields
  {
    name: "LLLL Online — Little Learners Love Literacy",
    url: "https://www.littlelearnersloveliteracy.com.au",
    description: "Official LLLL digital platform with interactive lessons, decodable books, and teaching resources aligned to the LLLL scope and sequence.",
    type: "website", isFree: 0, stageMin: "1", stageMax: "7.4",
  },
  {
    name: "Khan Academy Kids",
    url: "https://learn.khanacademy.org/khan-academy-kids/",
    description: "Systematic phonics app — no ads, free, covers foundational phonics. Great for independent practice between sessions.",
    type: "app", isFree: 1, stageMin: "1", stageMax: "5",
  },
  {
    name: "Teach Your Monster to Read",
    url: "https://www.teachyourmonstertoread.com",
    description: "Gamified phonics app — free on web browser. Works through CVC to early digraphs.",
    type: "app", isFree: 1, stageMin: "1", stageMax: "5",
  },
  {
    name: "Starfall.com — Phonics Activities",
    url: "https://www.starfall.com",
    description: "Interactive phonics activities — free version covers early stages. Great warm-up activity.",
    type: "website", isFree: 1, stageMin: "1", stageMax: "5",
  },
  {
    name: "FCRR Student Center Activities",
    url: "https://fcrr.org/student-center-activities",
    description: "Research-based printable activities organised by skill and grade. Print, laminate, and reuse.",
    type: "printable", isFree: 1, stageMin: "1", stageMax: "7.4",
  },
  {
    name: "Storyline Online — Read-Alouds",
    url: "https://storylineonline.net",
    description: "Celebrity read-alouds of popular children's books. Use for vocabulary and comprehension above current reading level.",
    type: "website", isFree: 1, stageMin: "1", stageMax: "7.4",
  },
  {
    name: "Dog on a Log Books (Free PDF)",
    url: "https://dogonalogbooks.com/free-printable-books/",
    description: "Free printable decodable books, organised by phonics level. Excellent variety — CVC through multisyllabic.",
    type: "book", isFree: 1, stageMin: "1", stageMax: "7.2",
  },
  {
    name: "Flyleaf Publishing — Free Decodable Books",
    url: "https://flyleafpublishing.com/free-decodable-books/",
    description: "Free decodable books organised by phonics skill. High quality CVC, digraphs, blends, and long vowels.",
    type: "book", isFree: 1, stageMin: "1", stageMax: "7.1",
  },
  {
    name: "Elkonin Boxes Printable (Sound Boxes)",
    url: "https://fcrr.org/student-center-activities",
    description: "Print blank Elkonin boxes for phonemic awareness — push a token into each box as you say each sound. Concrete tool for blending and segmenting.",
    type: "printable", isFree: 1, stageMin: "1", stageMax: "4",
  },
];

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Clearing existing phonics skills...");
  await db.delete(schema.phonicsSkills);
  console.log("✓ Cleared phonics skills");

  console.log("Clearing existing resources...");
  await db.delete(schema.resources);
  console.log("✓ Cleared resources");

  console.log("Seeding 63 LLLL skills...");
  for (const skill of SKILLS) {
    await db.insert(schema.phonicsSkills).values(skill);
    process.stdout.write(".");
  }
  console.log(`\n✓ Seeded ${SKILLS.length} skills`);

  console.log("Seeding resources...");
  for (const resource of RESOURCES) {
    await db.insert(schema.resources).values(resource);
    process.stdout.write(".");
  }
  console.log(`\n✓ Seeded ${RESOURCES.length} resources`);
}

main()
  .then(() => {
    console.log("\n🎉 Seed complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
