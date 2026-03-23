"use client";

import { useState, useEffect } from "react";
import { createChild, joinChild, setActiveChild, clearChildData } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type ChildEntry = { id: string; name: string };

const STORAGE_KEY = "myChildren";

function loadChildren(): ChildEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveChildren(list: ChildEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function ChildrenPage() {
  const router = useRouter();
  const [myChildren, setMyChildren] = useState<ChildEntry[]>([]);
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [createError, setCreateError] = useState("");
  const [joinError, setJoinError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clearTarget, setClearTarget] = useState<ChildEntry | null>(null);
  const [clearOpts, setClearOpts] = useState({
    progress: true,
    sessions: false,
    assessments: false,
    books: false,
  });
  const [clearConfirmName, setClearConfirmName] = useState("");
  const [clearLoading, setClearLoading] = useState(false);

  useEffect(() => {
    setMyChildren(loadChildren());
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setLoading(true);
    setCreateError("");
    try {
      const child = await createChild(createName.trim());
      const updated = [...loadChildren(), { id: child.id, name: child.name }];
      saveChildren(updated);
      setMyChildren(updated);
      setCreateName("");
      router.push("/");
    } catch {
      setCreateError("Failed to create child. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true);
    setJoinError("");
    try {
      const child = await joinChild(joinCode.trim());
      if (!child) {
        setJoinError("Share code not found. Check the code and try again.");
        return;
      }
      const existing = loadChildren();
      if (!existing.find((c) => c.id === child.id)) {
        const updated = [...existing, { id: child.id, name: child.name }];
        saveChildren(updated);
        setMyChildren(updated);
      }
      setJoinCode("");
      router.push("/");
    } catch {
      setJoinError("Failed to join. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSwitch(id: string) {
    await setActiveChild(id);
    router.push("/");
    router.refresh();
  }

  function handleCopy(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleClear() {
    if (!clearTarget) return;
    if (clearConfirmName !== clearTarget.name) return;
    const anyChecked = Object.values(clearOpts).some(Boolean);
    if (!anyChecked) return;
    setClearLoading(true);
    try {
      await clearChildData(clearTarget.id, clearOpts);
      setClearTarget(null);
      setClearConfirmName("");
      setClearOpts({ progress: true, sessions: false, assessments: false, books: false });
      router.refresh();
    } finally {
      setClearLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Children</h1>

      {/* My children */}
      {myChildren.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">My Children</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myChildren.map((child) => (
              <div key={child.id} className="flex items-center justify-between gap-3 py-1">
                <div>
                  <p className="font-medium text-gray-900">{child.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{child.id}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setClearTarget(child);
                      setClearConfirmName("");
                      setClearOpts({ progress: true, sessions: false, assessments: false, books: false });
                    }}
                  >
                    <Trash2 className="size-3 mr-1" /> Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(child.id)}
                  >
                    {copiedId === child.id ? "Copied!" : "Copy code"}
                  </Button>
                  <Button size="sm" onClick={() => handleSwitch(child.id)}>
                    Switch
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Create child */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Add a Child</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="childName">Child&apos;s name</Label>
              <Input
                id="childName"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Emma"
              />
            </div>
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            <Button type="submit" disabled={loading || !createName.trim()}>
              Create &amp; start tracking
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Join child */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Join with a Share Code</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">
            Enter a share code from another parent to track the same child.
          </p>
          <form onSubmit={handleJoin} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="shareCode">Share code</Label>
              <Input
                id="shareCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="e.g. a3f9x2k1"
                className="font-mono"
              />
            </div>
            {joinError && <p className="text-sm text-red-600">{joinError}</p>}
            <Button type="submit" variant="outline" disabled={loading || !joinCode.trim()}>
              Join child
            </Button>
          </form>
        </CardContent>
      </Card>

      {clearTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border-2 border-red-200 overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 px-5 py-4 border-b border-red-100 flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-red-900">Reset data for {clearTarget.name}</p>
                <p className="text-xs text-red-600">This cannot be undone</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="px-5 py-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Select what to clear</p>

              {(
                [
                  { key: "progress", label: "Phonics progress", desc: "All skill statuses reset to not started" },
                  { key: "sessions", label: "Session history", desc: "All logged reading sessions deleted" },
                  { key: "assessments", label: "Assessments", desc: "All WPM, sounds, sight word results deleted" },
                  { key: "books", label: "Books", desc: "All logged books deleted" },
                ] as const
              ).map(({ key, label, desc }) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    clearOpts[key] ? "border-red-300 bg-red-50/50" : "border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={clearOpts[key]}
                    onChange={(e) => setClearOpts((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="size-4 accent-red-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}

              {/* Name confirmation */}
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1.5">
                  Type <span className="font-bold text-red-700">{clearTarget.name}</span> to confirm
                </p>
                <Input
                  value={clearConfirmName}
                  onChange={(e) => setClearConfirmName(e.target.value)}
                  placeholder="Type child's name…"
                  className="border-red-200 focus-visible:ring-red-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setClearTarget(null);
                  setClearConfirmName("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={
                  clearConfirmName !== clearTarget.name ||
                  !Object.values(clearOpts).some(Boolean) ||
                  clearLoading
                }
                onClick={handleClear}
              >
                {clearLoading ? "Clearing…" : "Clear selected"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
