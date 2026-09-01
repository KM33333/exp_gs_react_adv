"use client";
// src/app/page.tsx

import { useState } from "react";

export default function Home() {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState("やさしめ"); // ← 追加

  // const topic = "自己紹介を1分で";
  const [topic, setTopic] = useState("転職活動"); // ← 課題

  async function handleSubmit() {
    setLoading(true);
    setFeedback("");

    // 自分のAPI(/api/coach)を呼ぶ（Groqのキーはこの先＝サーバー側にある）
    // 通信やAPI側の失敗で画面が無反応にならないよう try/catch/finally で守る
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, answer, tone }),
      });
      const data = await res.json();
      setFeedback(data.feedback ?? "エラーが起きました。もう一度お試しください。");
    } catch {
      setFeedback("通信に失敗しました。ネットワークを確認してください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 640 }}
    className="bg-blue-50"
    >
      <h1 className="text-xl font-bold font-mono">AI 練習コーチ</h1> {/* テキストサイズと文字を太字 */}
      {/* https://zenn.dev/tacchan5424/books/22d87ed6bc8550/viewer/91a5e9 フォント変更 */}
      {/* <p>お題：{topic}</p> */}
      <div style={{ marginTop: 8 }}
      className="m-2"
      >
        自己紹介のシチュエーション：
        <select value={topic} onChange={(e) => setTopic(e.target.value)}
          className="border border-gray-300 rounded-md m-2 
          focus:outline-none focus:ring-1 w-auto h-12"
          // bg は背景色、textは文字色、borderは枠線色、forcusは選択時
          >
          <option value="就職活動">就職活動</option>
          <option value="転職活動">転職活動</option>
          <option value="転校した時">転校した時</option>
          <option value="初対面の親戚に会う時">初対面の親戚に会う時</option>


        </select>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={10}
        style={{ width: "100%" }}
        placeholder="200 文字以内でここに回答を入力"
        maxLength={200} 
        className="m-2 focus:ring-1 w-auto border border-gray-300 h-20"
      />
      
      <p className="text-sm text-gray-500 m-2">
      {answer.length} / 200 文字
      </p>

      <div style={{ marginTop: 8 }}
      className="m-2">
        口調：
        <select value={tone} onChange={(e) => setTone(e.target.value)}
          className="focus:ring-1 w-auto border border-gray-300 h-12"
          >
          <option value="やさしめ">やさしめ</option>
          <option value="スパルタ">スパルタ</option>
          <option value="ていねい">ていねい</option>
        </select>
      </div>

    <div className="flex justify-end w-full">
      <button onClick={handleSubmit} disabled={loading} style={{ marginTop: 12 }}
      className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "生成中…" : "コーチに見てもらう"}
      </button>
    </div>
      {feedback && (
       <p style={{ whiteSpace: "pre-wrap", marginTop: 16 }}
        className="m-2 focus:ring-1 w-auto border border-gray-300 h-100 font-serif bg-white px-4 py-2"
         >{feedback}</p>
      )}
    </main>
  );
}