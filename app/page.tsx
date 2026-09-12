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
  const [topic, setTopic] = useState("自己紹介"); // ← 課題
  const [speaking, setSpeaking] = useState(false); // 読み上げ中かどうか
  const [volume, setVolume] = useState(1); // 音量 0〜1
  const [rate, setRate] = useState(1); // 速さ 0.5〜2（1が普通）
  const audioRef = useRef<HTMLAudioElement | null>(null); // 今鳴っている音声
  async function speak() {
    if (speaking) return; // ★連打を無視する
    setSpeaking(true);

    try {
      audioRef.current?.pause(); // ★前の音声が残っていたら止める（fetchの前に置く）
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
      audio.volume = volume; // ★追加
      audio.playbackRate = rate; // ★追加
      audioRef.current = audio; // ★今の音声を覚えておく
      audio.onended = () => setSpeaking(false);

      audio.onended = () => setSpeaking(false); // ★終わったら また押せる
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
    if (audioRef.current) audioRef.current.volume = v; // 再生中にも反映
  }

  function changeRate(r: number) {
    setRate(r);
    if (audioRef.current) audioRef.current.playbackRate = r; // 再生中にも反映
  }

  async function handleSubmit() {
    setLoading(true);
    setFeedback("");
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, answer, smileScore }),
    });
    const data = await res.json();
    setFeedback(data.feedback);
    setLoading(false);
  }

  async function save() {
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, answer, smileScore, feedback }),
    });
    alert("保存しました");
  }

  return (
    <main style={{ padding: 24, maxWidth: 1280 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>AI練習コーチ</h1>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", marginTop: 16 }}>
        {/* 左側：操作エリア（カメラ・入力・ボタン） */}
        <div style={{ flex: 1 }}>
          <FaceMeter onScore={setSmileScore} />

          {/* <p style={{ marginTop: 16 }}>お題：{topic}</p> */}
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{ width: "50%", marginBottom: 12, border: "1px solid gray", margin: 10 }}
          >
            <option value="自己紹介">自己紹介</option>
            <option value="志望動機">志望動機</option>
            <option value="転職理由">転職理由</option>
          </select>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            style={{ width: "100%", border: "1px solid gray" }}
            placeholder="200 文字以内でここに回答を入力"
            maxLength={200} 
          />
          <div className="flex justify-end">
            <p className="text-sm text-gray-500 m-2" style={{ fontSize: 18 }}>
              {answer.length} / 200 文字
            </p>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSubmit} disabled={loading} style={{ marginTop: 12,marginBottom: 8 }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
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

              </label>
            </div>
        </div>

        {/* 右側：結果エリア（スコア・フィードバック・履歴リンク） */}
        <div style={{ flex: 1 }}>


          {/* <p style={{ marginTop: 16,fontSize: 24 }}>いまの笑顔率：{smileScore}%</p> */}
          {smileScore > 70 ? (
            <p style={{ marginTop: 16,fontSize: 24 }}>笑顔率{smileScore}% ：素晴らしい笑顔です👍</p>
              ) : smileScore > 30 && smileScore <= 70 ? (
            <p style={{ marginTop: 16,fontSize: 24 }}>笑顔率{smileScore}% ：良い感じです🆗</p>
              ) : (
            <p style={{ marginTop: 16,fontSize: 24 }}>笑顔率{smileScore}% ：頑張りましょう💪</p>
          )}
          {/* <p style={{ marginTop: 16, fontSize: 20 }}>コーチのフィードバックは、👇に表示されるよ</p>

          {feedback && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              
              <p style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>{feedback}</p>
              <div className="flex justify-end">
               <button
                 onClick={speak}
                 disabled={speaking}
                 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-3">
                 {speaking ? "🔊 読み上げ中…" : "🔊 読み上げ"}
               </button>
               {speaking && <button onClick={stopSpeak}>⏹ 停止</button>}
              </div>
              <div className="flex justify-end">
               <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-3">
                 <button onClick={save}>💾 保存する</button>
               </div>
              </div>
            </div>
          )} */}
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
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-3">
                    {speaking ? "🔊 読み上げ中…" : "🔊 読み上げ"}
                </button>
                  {speaking && <button onClick={stopSpeak}>⏹ 停止</button>}
            </div>
            <div className="flex justify-end">
              <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-3">
                <button onClick={save}>💾 保存する</button>
              </div>
            </div>
          </div>
      )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link
              href="/history"
              style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, display: "inline-block", marginTop: 8 }}>
             📖 今までの練習結果はこっち
            </Link>
          </div>
          </div>
        </div>
    </main>
  );

}