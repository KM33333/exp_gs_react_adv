"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MemoEditor({ id, initialMemo }: { id: number; initialMemo: string }) {
  const [memo, setMemo] = useState(initialMemo);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memo }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <input
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="メモを入力"
        style={{ flex: 1 }}
      />
      <button onClick={handleSave} disabled={saving}>
        {saving ? "保存中…" : "💾 保存"}
      </button>
    </div>
  );
}