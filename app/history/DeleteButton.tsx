"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm("この記録を削除しますか？");
    if (!ok) return;

    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={handleDelete} style={{ color: "#dc2626" }}>
      🗑 削除
    </button>
  );
}