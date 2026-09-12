// app/history/[id]/page.tsx
import { db } from "@/db";
import { sessions } from "@/db/schema";
// eqは、**「データベースの表の中にあるid列の値」と、「URLから取り出したid(数値に変換したもの)」**が等しいかどうかを見ています。
// drizzle-ormは、TypeScript(JavaScript)のコードから、データベース(PostgreSQLなど)を簡単に操作できるようにしてくれる「ライブラリ(部品集)」の名前
import { eq } from "drizzle-orm";

// _request→リクエストの情報(メソッド、URL全体、ヘッダー、本文など)、params→ID
export default async function HistoryDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await db.select().from(sessions).where(eq(sessions.id, Number(id)));
  const row = rows[0];

  if (!row) return <main style={{ padding: 24 }}>見つかりませんでした。</main>;

  return (
    <main style={{ padding: 24, maxWidth: 640 }}>
      <h1>{row.topic}</h1>
      <p>😊 笑顔スコア {row.smileScore ?? 0}%</p>
      <p style={{ whiteSpace: "pre-wrap" }}>🗣 {row.answerText}</p>
      <p style={{ whiteSpace: "pre-wrap" }}>🤖 {row.feedback}</p>
    </main>
  );
}