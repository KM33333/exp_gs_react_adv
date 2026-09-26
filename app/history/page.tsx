// app/history/page.tsx
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import MemoEditor from "./MemoEditor";

export default async function HistoryPage() {
  // ① まず未ログインを弾く（他のAPIと同じ思想＝ログインしていない人は入れない）
  const { userId } = await auth();
  if (!userId) {
    return (
      <main className="p-8">
        <p>履歴を見るにはログインしてください。</p>
      </main>
    );
  }

  // ② 一覧は"自分のだけ"（userId 一致）・新しい順
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.createdAt));

  return (
    <main style={{ padding: 24, maxWidth: 1280 }}>
      <h1>過去の記録（{rows.length}件）</h1>
      {rows.length === 0 ? (
        <p>まだありません。練習して「保存」しましょう。</p>
      ) : (
        <>
              {/* 成長グラフ（古い→新しい の順に並べ替えて棒で表示） */}
      {/* <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 100 }}>
        {[...rows].reverse().map((row) => (
          <div
            key={row.id}
            title={`${row.smileScore}%`}
            style={{
              width: 16,
              height: `${row.smileScore ?? 0}%`,
              background: "#2563eb",
            }}
          />
        ))}
      </div> */}
        {/* <ul>
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={`/history/${row.id}`}>
                {row.topic} ／ 笑顔 {row.smileScore ?? 0}%
              </Link>
            </li>
          ))}
        </ul> */}
          {/* 成長グラフ（古い→新しい の順に並べ替えて折れ線で表示） */}
          <p style={{ fontSize: 14, fontWeight: 600, marginTop: 24, marginBottom: 8, color: "#555" }}>
            笑顔スコアの推移
          </p>
          {(() => {
            const data = [...rows].reverse();
            const width = 1000;
            const height = 160;
            const padding = 16;
            const chartW = width - padding * 2;
            const chartH = height - padding * 2;
            const stepX = data.length > 1 ? chartW / (data.length - 1) : 0;

            const points = data.map((row, i) => {
              const score = row.smileScore ?? 0;
              const x = padding + stepX * i;
              const y = padding + chartH - (score / 100) * chartH;
              return { x, y, score };
            });

            const lineD = points
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ");

            const areaD =
              `M ${points[0]?.x ?? padding} ${padding + chartH} ` +
              points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
              ` L ${points[points.length - 1]?.x ?? padding} ${padding + chartH} Z`;

            return (
              <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
                {/* 0% / 50% / 100% の目安線（横） */}
                {[0, 50, 100].map((mark) => {
                  const y = padding + chartH - (mark / 100) * chartH;
                  return (
                    <line
                      key={mark}
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke="#EEE"
                      strokeWidth={1}
                    />
                  );
                })}

                <path d={areaD} fill="#2563eb" opacity={0.08} />
                <path d={lineD} fill="none" stroke="#2563eb" strokeWidth={2.5} />

                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={4} fill="#2563eb" stroke="#FFF" strokeWidth={1.5} />
                ))}

                <text x={2} y={padding + chartH + 4} fontSize={10} fill="#999">0%</text>
                <text x={2} y={padding + chartH / 2} fontSize={10} fill="#999">50%</text>
                <text x={2} y={padding + 4} fontSize={10} fill="#999">100%</text>
              </svg>
            );
          })()}

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
            <colgroup><col style={{ width: "7%" }} /> {/* お題 */}
            <col style={{ width: "7%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "8%" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>お題</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>笑顔率</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>悲しみ率</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>怒り率</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>驚き率</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>無表情率</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>恐怖率</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>嫌悪率</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>フィードバック</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>日付</th>
                {/* <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>メモ</th> */}
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>削除</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    <Link href={`/history/${row.id}`}>{row.topic}</Link>
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {row.smileScore ?? 0}%
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {row.angryScore ?? 0}%
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {row.sadScore ?? 0}%
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {row.surprisedScore ?? 0}%
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {row.neutralScore ?? 0}%
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {row.fearfulScore ?? 0}%
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {row.disgustedScore ?? 0}%
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {row.feedback ?? 0}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {`${row.createdAt.getMonth() + 1}/${row.createdAt.getDate()}`}
                  </td>
                  {/* <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    <MemoEditor id={row.id} initialMemo={row.memo ?? ""} />
                  </td> */}
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    <DeleteButton id={row.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <Link
              href="/"
              style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, display: "inline-block", marginTop: 8 }}>
             💪 練習に戻る
            </Link>
          </div>
        </>
         )}
    </main>
  );
}