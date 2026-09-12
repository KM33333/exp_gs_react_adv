// app/api/sessions/[id]/route.ts
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

// 1件だけ取得
export async function GET(
  // request：APIが受け取る情報（get、json。URL）
  // params：URLの中に埋め込まれた、対象を特定するための値(idなど)
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Next.js16では params は await が必要
  const rows = await db.select().from(sessions).where(eq(sessions.id, Number(id)));
  return Response.json(rows[0] ?? null);
}

// 1件 削除
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(sessions).where(eq(sessions.id, Number(id)));
  return Response.json({ ok: true });
}

// 1件 更新（メモを保存）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  await db
    .update(sessions)
    .set({ memo: body.memo })
    .where(eq(sessions.id, Number(id)));

  return Response.json({ ok: true });
}