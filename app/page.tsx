"use client";
// src/app/page.tsx

import { useState } from "react";
import FaceMeter from "./FaceMeter"; // ← ① 追加
import Recorder from "./Recorder";

export default function Home() {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [smileScore, setSmileScore] = useState(0); // ← ② 追加
  const topic = "自己紹介を1分で";

  async function handleSubmit() {
    setLoading(true);
    setFeedback("");
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, answer, smileScore }), // ← ③ 追加
    });
    const data = await res.json();
    setFeedback(data.feedback);
    setLoading(false);
  }

  // 音声読み上げ機能
  async function speak() {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: feedback }),
    });
    const data = await res.json();
    const audio = new Audio("data:audio/mp3;base64," + data.audio);
    audio.play();
  }

  return (
    <main style={{ padding: 24, maxWidth: 640 }}>
      <h1>AI練習コーチ</h1>
      <FaceMeter onScore={setSmileScore} />
      <p>いまの笑顔率：{smileScore}%</p>
      {/* <p onClick={() => alert("段落クリック")}>お題：{topic}</p> */}
      <p>お題：{topic}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={5}
        style={{ width: "100%" }}
        placeholder="ここに回答を入力"
      />
      {/* textarea の下あたり */}
      <Recorder onText={(t) => setAnswer(t)} />

      <button
        // onClick={() => {
        //   alert("クリックされた");
        //   handleSubmit();
        // }}
        // disabled={loading}
        // style={{ marginTop: 12 }}
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 12 }}
      >
        {loading ? "生成中…" : "コーチに見てもらう"}
      </button>
      {feedback && (
        <>
          <p style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>{feedback}</p>
          <button onClick={speak}>🔊 読み上げ</button>
        </>
      )}
    </main>
  );
}
