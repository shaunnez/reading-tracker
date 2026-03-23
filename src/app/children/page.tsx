"use client";

import { useState, useEffect } from "react";
import { createChild, joinChild, setActiveChild } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    </div>
  );
}
