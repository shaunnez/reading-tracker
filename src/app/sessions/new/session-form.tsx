"use client";

import { useState } from "react";
import { createSession } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ACTIVITIES = [
  { key: "blending", label: "🔊 Blending" },
  { key: "dictation", label: "✏️ Dictation" },
  { key: "decodable_reading", label: "📖 Decodable reading" },
  { key: "phonemic_awareness", label: "👂 Phonemic awareness" },
  { key: "read_aloud", label: "📚 Read aloud" },
  { key: "sight_words", label: "👁️ Sight words" },
];

const RATINGS = [
  { value: 1, emoji: "😢", label: "Tough" },
  { value: 2, emoji: "😕", label: "Hard" },
  { value: 3, emoji: "😐", label: "OK" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Great" },
];

type Skill = {
  id: number;
  name: string;
  sequenceOrder: number;
  status: string;
};

export default function SessionForm({ skills }: { skills: Skill[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [skillId, setSkillId] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("15");
  const [notes, setNotes] = useState("");

  const toggleActivity = (key: string) => {
    setSelectedActivities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSession({
        date,
        durationMinutes: duration ? parseInt(duration) : undefined,
        phonicsSkillId: skillId ? parseInt(skillId) : undefined,
        activities: selectedActivities.length > 0 ? selectedActivities.join(",") : undefined,
        rating: rating ?? undefined,
        notes: notes || undefined,
      });
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const inProgressSkills = skills.filter((s) => s.status === "in_progress");
  const notStartedSkills = skills.filter((s) => s.status === "not_started");
  const skillOptions = [...inProgressSkills, ...notStartedSkills];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="15"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="skill">Phonics skill practiced</Label>
            <select
              id="skill"
              value={skillId}
              onChange={(e) => setSkillId(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">— select if applicable —</option>
              {skillOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.sequenceOrder} {s.name}
                  {s.status === "in_progress" ? " (in progress)" : ""}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <Label className="mb-3 block">Activities (select all that apply)</Label>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITIES.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => toggleActivity(a.key)}
                className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selectedActivities.includes(a.key)
                    ? "bg-indigo-50 border-indigo-300 text-indigo-800"
                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <Label className="mb-3 block">How did it go?</Label>
          <div className="flex gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRating(r.value)}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg border transition-colors ${
                  rating === r.value
                    ? "bg-indigo-50 border-indigo-300"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{r.emoji}</span>
                <span className="text-xs text-gray-500 mt-0.5">{r.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What went well? Any tricky words? Things to revisit?"
          rows={3}
          className="mt-1"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
        {loading ? "Saving..." : "Save Session"}
      </Button>
    </form>
  );
}
