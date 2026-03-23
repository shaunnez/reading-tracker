"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, parseISO, eachDayOfInterval, subDays } from "date-fns";

type Assessment = {
  id: number;
  date: string;
  type: string;
  value: number;
  notes: string | null;
};

type Session = {
  id: number;
  date: string;
  durationMinutes: number | null;
  rating: number | null;
};

type Skill = {
  id: number;
  status: string;
  phase: number;
};

export default function ProgressCharts({
  assessments,
  sessions,
  skills,
}: {
  assessments: Assessment[];
  sessions: Session[];
  skills: Skill[];
}) {
  const wcpmData = assessments
    .filter((a) => a.type === "wcpm")
    .map((a) => ({
      date: format(parseISO(a.date), "MMM d"),
      wpm: a.value,
    }));

  // Skills by phase
  const phaseData = [1, 2, 3, 4].map((phase) => {
    const phaseSkills = skills.filter((s) => s.phase === phase);
    return {
      name: `Phase ${phase}`,
      mastered: phaseSkills.filter((s) => s.status === "mastered").length,
      total: phaseSkills.length,
    };
  });

  // Calendar heatmap — last 60 days
  const today = new Date();
  const sixtyDaysAgo = subDays(today, 59);
  const allDays = eachDayOfInterval({ start: sixtyDaysAgo, end: today });
  const sessionDates = new Set(sessions.map((s) => s.date));

  const weeks: Array<Array<{ date: string; hasSession: boolean }>> = [];
  let currentWeek: Array<{ date: string; hasSession: boolean }> = [];
  allDays.forEach((day, i) => {
    const dateStr = format(day, "yyyy-MM-dd");
    currentWeek.push({ date: dateStr, hasSession: sessionDates.has(dateStr) });
    if ((i + 1) % 7 === 0 || i === allDays.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const totalSessions = sessions.length;
  const daysWithSessions = sessionDates.size;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">{totalSessions}</p>
            <p className="text-xs text-gray-500 mt-1">Total sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">{daysWithSessions}</p>
            <p className="text-xs text-gray-500 mt-1">Days practiced</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {skills.filter((s) => s.status === "mastered").length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Skills mastered</p>
          </CardContent>
        </Card>
      </div>

      {/* WPM chart */}
      {wcpmData.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Words Per Minute Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={wcpmData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, "auto"]} />
                <Tooltip />
                <ReferenceLine y={60} stroke="#22c55e" strokeDasharray="4 4" label={{ value: "Grade 1 target", position: "right", fontSize: 10 }} />
                <Line type="monotone" dataKey="wpm" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-gray-400">
            <p>No WPM assessments yet.</p>
            <p className="text-sm mt-1">Add assessments monthly to see your progress chart.</p>
          </CardContent>
        </Card>
      )}

      {/* Phase progress bars */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Skills by Phase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {phaseData.map((p) => (
            <div key={p.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{p.name}</span>
                <span className="text-gray-500">{p.mastered}/{p.total}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${(p.mastered / p.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Session heatmap */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Session Streak — Last 60 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 flex-wrap">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.date}
                    title={day.date}
                    className={`w-4 h-4 rounded-sm ${
                      day.hasSession ? "bg-indigo-500" : "bg-gray-100"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Each square = 1 day · Purple = session logged
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
