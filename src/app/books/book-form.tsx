"use client";

import { useState } from "react";
import { createBook } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const LEVEL_OPTIONS = [
  { value: 1, label: "CVC only (Bob Books Set 1)" },
  { value: 10, label: "Digraphs (sh, ch, th)" },
  { value: 15, label: "Blends (bl, st, cr)" },
  { value: 21, label: "Long vowels / Silent-e" },
  { value: 25, label: "Vowel teams (ee, ai, oa)" },
  { value: 30, label: "R-controlled (ar, or, er)" },
  { value: 38, label: "Multisyllabic words" },
];

export default function BookForm({ currentSkillLevel, childId }: { currentSkillLevel: number; childId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [series, setSeries] = useState("");
  const [level, setLevel] = useState(String(currentSkillLevel));
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [accuracy, setAccuracy] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      await createBook({
        childId,
        title,
        series: series || undefined,
        phonicsLevel: parseInt(level),
        dateRead: date,
        accuracyPct: accuracy ? parseInt(accuracy) : undefined,
        notes: notes || undefined,
      });
      setTitle("");
      setSeries("");
      setAccuracy("");
      setNotes("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="title">Book title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mat and the Fat Cat"
              required
            />
          </div>
          <div>
            <Label htmlFor="series">Series (optional)</Label>
            <Input
              id="series"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              placeholder="e.g. Bob Books Set 1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Date read</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="accuracy">Accuracy %</Label>
              <Input
                id="accuracy"
                type="number"
                min="0"
                max="100"
                value={accuracy}
                onChange={(e) => setAccuracy(e.target.value)}
                placeholder="e.g. 95"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="level">Phonics level</Label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did she find it? Any tricky parts?"
              rows={2}
            />
          </div>
          <Button type="submit" disabled={loading || !title} className="w-full bg-indigo-600 hover:bg-indigo-700">
            {loading ? "Saving…" : "Save Book"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
