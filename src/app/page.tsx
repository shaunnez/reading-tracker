import { getDashboardStats } from "@/lib/actions";
import { getActiveChildId } from "@/lib/child-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import NoChildBanner from "@/components/no-child-banner";

const STAGE_LABELS: Record<string, string> = {
  "1": "Stage 1 · Foundation",
  "2": "Stage 2 · Early Consonants",
  "3": "Stage 3 · More Consonants",
  "4": "Stage 4 · Completing the Alphabet",
  "4+": "Stage 4+ · Double Letters & Plurals",
  "5": "Stage 5 · Consonant Blends",
  "6": "Stage 6 · Digraphs",
  "7.1": "Stage 7 Unit 1 · Long Vowel Teams",
  "7.2": "Stage 7 Unit 2 · R-controlled Vowels",
  "7.3": "Stage 7 Unit 3 · Diphthongs",
  "7.4": "Stage 7 Unit 4 · Split Digraphs",
};
const WCPM_TARGETS: Record<string, number> = {
  "1": 10, "2": 20, "3": 30, "4": 40, "4+": 45,
  "5": 55, "6": 65, "7.1": 75, "7.2": 85, "7.3": 90, "7.4": 100,
};

export default async function DashboardPage() {
  const childId = await getActiveChildId();
  if (!childId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Reading Tracker</h1>
        <NoChildBanner />
      </div>
    );
  }

  let stats;
  try {
    stats = await getDashboardStats(childId);
  } catch {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Reading Tracker</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          <p className="font-medium">Database not connected</p>
          <p className="text-sm mt-1">Add your <code>DATABASE_URL</code> to <code>.env.local</code> and run <code>npm run db:push && npm run db:seed</code></p>
        </div>
      </div>
    );
  }

  const progressPct = Math.round((stats.mastered / stats.total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reading Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">
            {STAGE_LABELS[stats.currentStage]} · {stats.mastered} of {stats.total} skills mastered
          </p>
        </div>
        <Link
          href="/sessions/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Log Session
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Day Streak"
          value={stats.streak === 0 ? "No sessions yet" : `${stats.streak} day${stats.streak !== 1 ? "s" : ""}`}
          icon="🔥"
          highlight={stats.streak >= 7}
        />
        <StatCard
          label="Skills Mastered"
          value={`${stats.mastered} / ${stats.total}`}
          icon="✅"
        />
        <StatCard
          label="Latest WPM"
          value={stats.latestWcpm ? `${stats.latestWcpm} wpm` : "Not assessed"}
          icon="📖"
        />
        <StatCard
          label="Current Stage"
          value={`Stage ${stats.currentStage}`}
          icon="📍"
        />
      </div>

      {/* Overall progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Phonics Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{progressPct}% of phonics curriculum complete</span>
            <span>{stats.mastered} skills mastered</span>
          </div>
          <Progress value={progressPct} className="h-3" />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Stage 1</span>
            <span>Stage 4</span>
            <span>Stage 6</span>
            <span>Stage 7.4</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Current focus */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Current Focus</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.focusSkill ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={stats.focusSkill.status === "in_progress" ? "default" : "secondary"}>
                    {stats.focusSkill.status === "in_progress" ? "In Progress" : "Up Next"}
                  </Badge>
                  <span className="text-xs text-gray-400">Skill #{stats.focusSkill.sequenceOrder}</span>
                </div>
                <p className="font-semibold text-gray-900">{stats.focusSkill.name}</p>
                {stats.focusSkill.examples && (
                  <p className="text-sm text-gray-500 mt-1">
                    Examples: <span className="font-mono">{stats.focusSkill.examples}</span>
                  </p>
                )}
                <Link href="/phonics" className="text-indigo-600 text-sm mt-3 inline-block hover:underline">
                  View Phonics Map →
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">All skills mastered! 🎉</p>
            )}
          </CardContent>
        </Card>

        {/* Recent sessions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentSessions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">No sessions yet</p>
                <Link href="/sessions/new" className="text-indigo-600 text-sm mt-1 inline-block hover:underline">
                  Log your first session →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700">{s.date}</span>
                    <div className="flex items-center gap-2">
                      {s.durationMinutes && (
                        <span className="text-xs text-gray-400">{s.durationMinutes}min</span>
                      )}
                      {s.rating && (
                        <span className="text-sm">{"⭐".repeat(s.rating)}</span>
                      )}
                    </div>
                  </div>
                ))}
                <Link href="/sessions" className="text-indigo-600 text-xs mt-1 inline-block hover:underline">
                  View all sessions →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* WPM target info */}
      <Card className="bg-indigo-50 border-indigo-100">
        <CardContent className="pt-4">
          <p className="text-sm text-indigo-800">
            <strong>Stage {stats.currentStage} target:</strong> {WCPM_TARGETS[stats.currentStage]} words per minute · {" "}
            {stats.latestWcpm
              ? `Current: ${stats.latestWcpm} wpm (${stats.latestWcpm >= WCPM_TARGETS[stats.currentStage] ? "✅ On track" : "📈 Keep going"})`
              : "No WPM assessment yet — add one in Assessments"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-orange-200 bg-orange-50" : ""}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{icon}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
        <p className="font-semibold text-gray-900 text-sm">{value}</p>
      </CardContent>
    </Card>
  );
}
