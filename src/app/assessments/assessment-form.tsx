"use client";

import { useState } from "react";
import { createAssessment } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const TYPES = [
  { value: "wcpm", label: "Words Per Minute (WPM)" },
  { value: "sounds_known", label: "Letter Sounds Known (out of 26)" },
  { value: "words_decoded", label: "CVC Words Decoded (out of 10)" },
  { value: "sight_words", label: "Sight Words Known" },
];

export default function AssessmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("wcpm");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;
    setLoading(true);
    try {
      await createAssessment({ date, type, value: parseFloat(value), notes: notes || undefined });
      setValue("");
      setNotes("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="type">Assessment type</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="value">
              {type === "wcpm" ? "Words per minute" : "Score"}
            </Label>
            <Input
              id="value"
              type="number"
              min="0"
              step="0.5"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "wcpm" ? "e.g. 45" : "e.g. 20"}
              required
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What text did she read? Any observations?"
              rows={2}
            />
          </div>
          <Button type="submit" disabled={loading || !value} className="w-full bg-indigo-600 hover:bg-indigo-700">
            {loading ? "Saving…" : "Save Assessment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
