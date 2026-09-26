"use client";
// app/page.tsx

import { useState, useRef } from "react";
import Link from "next/link";
import FaceMeter from "./FaceMeter";
import Recorder from "./Recorder";

export default function Home() {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [smileScore, setSmileScore] = useState(0);

  const [topic, setTopic] = useState("今日の出来事"); // ← 課題
  const [speaking, setSpeaking] = useState(false); // 読み上げ中かどうか
  const [volume, setVolume] = useState(1); // 音量 0〜1

  const [rate, setRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [sadScore, setSadScore] = useState(0);
  const [angryScore, setAngryScore] = useState(0);
  const [surprisedScore, setSurprisedScore] = useState(0);
  const [neutralScore, setNeutralScore] = useState(0);
  const [fearfulScore, setFearfulScore] = useState(0);
  const [disgustedScore, setDisgustedScore] = useState(0);

  async function speak() {
    if (speaking) return;
    setSpeaking(true);

    try {
      audioRef.current?.pause();
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: feedback }),
      });
      const data = await res.json();

      if (!res.ok || !data.audio) {
        alert("に失敗しました。");
        setSpeaking(false);
        return;
      }

      const audio = new Audio("data:audio/mp3;base64," + data.audio);
      audio.volume = volume;
      audio.playbackRate = rate;
      audioRef.current = audio;
      audio.onended = () => setSpeaking(false);
      await audio.play();
    } catch (e) {
      console.error(e);
      alert("読み上げに失敗しました。");
      setSpeaking(false);
    }
  }
  function stopSpeak() {
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(false);
  }

  function changeVolume(v: number) {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  function changeRate(r: number) {
    setRate(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  }

  async function handleSubmit() {
    setLoading(true);
    setFeedback("");
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, answer, smileScore, sadScore, angryScore, surprisedScore, neutralScore, fearfulScore, disgustedScore }),
    });
    const data = await res.json();
    setFeedback(data.feedback);
    setLoading(false);
  }

  async function save() {
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, answer, smileScore, feedback, sadScore, angryScore, surprisedScore, neutralScore, fearfulScore, disgustedScore }),
    });
    alert("保存しました");
  }

  async function deliver() {
    const res = await fetch("/api/deliver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback }),
    });
    if (res.ok) alert("メールを送りました");
    else alert("メール送信に失敗しました（無料枠では自分の登録メール宛のみ送れます）");
  }

  return (
    <main style={{ padding: 24, maxWidth: 1280 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>エモスコ 〜 表情分析アプリ 〜 </h1>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", marginTop: 16 }}>
        {/* 左側：操作エリア */}
        <div style={{ flex: 1 }}>
          <FaceMeter
            onHappy={setSmileScore}
            onAngry={setAngryScore}
            onSad={setSadScore}
            onSurprised={setSurprisedScore}
            onNeutral={setNeutralScore}
            onFearful={setFearfulScore}
            onDisgusted={setDisgustedScore}
          />

          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{ width: "50%", marginBottom: 12, border: "1px solid gray", margin: 10 }}
          >
            <option value="今日の出来事">今日の出来事</option>
            <option value="体調">体調</option>
            {/* <option value="転職理由">転職理由</option> */}
          </select>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            style={{ width: "100%", border: "1px solid gray" }}
            placeholder="ここに回答を入力"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ marginTop: 12, marginBottom: 8 }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? "生成中…" : "コーチに見てもらう"}
            </button>
          </div>

          <Recorder onText={(t) => setAnswer(t)} />

          <div style={{ marginTop: 8 }}>
            <label>
              🔉 音量 {Math.round(volume * 100)}%
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                style={{ marginLeft: 8, marginTop: 8 }}
              />
            </label>
            <div>
              <label>
                ⏩ 速さ {rate.toFixed(1)}倍
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={rate}
                  onChange={(e) => changeRate(Number(e.target.value))}
                  style={{ marginLeft: 8, marginTop: 8 }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* 右側：結果エリア */}
        <div style={{ flex: 1 }}>
          <table>
            <colgroup><col style={{ width: "50%" }} /><col style={{ width: "50%" }} /></colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>項目</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>スコア</th>
              </tr>
            </thead>
            <tbody>
              <tr><th><p className="text-left">笑顔率😊　</p></th><td><p>{smileScore}%</p></td></tr>
              <tr><th><p className="text-left">悲しみ率😢　</p></th><td><p>{sadScore}%</p></td></tr>
              <tr><th><p className="text-left">怒り率😠　</p></th><td><p>{angryScore}%</p></td></tr>
              <tr><th><p className="text-left">驚き率😲　</p></th><td><p>{surprisedScore}%</p></td></tr>
              <tr><th><p className="text-left">中立率😐　</p></th><td><p>{neutralScore}%</p></td></tr>
              <tr><th><p className="text-left">恐怖率😨　</p></th><td><p>{fearfulScore}%</p></td></tr>
              <tr><th><p className="text-left">嫌悪率🤢　</p></th><td><p>{disgustedScore}%</p></td></tr>
            </tbody>
          </table>

          {!feedback && (
            <p style={{ marginTop: 16, fontSize: 20 }}>コーチのフィードバックは、👇に表示されるよ</p>
          )}

          {feedback && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>{feedback}</p>
              <div className="flex justify-end">
                <button
                  onClick={speak}
                  disabled={speaking}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-3"
                >
                  {speaking ? "🔊 読み上げ中…" : "🔊 読み上げ"}
                </button>
                {speaking && <button onClick={stopSpeak}>⏹ 停止</button>}
              </div>
              <div className="flex justify-end" style={{ gap: 8 }}>
                <button onClick={save} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-3">
                  💾 保存する
                </button>
              </div>
              <div className="flex justify-end" style={{ gap: 8 }}>
                <button onClick={deliver} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-3">
                  ✉️ メールで受け取る
                </button>
              </div>

            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link
              href="/history"
              style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, display: "inline-block", marginTop: 8 }}
            >
              📖 今までの練習結果はこっち
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}