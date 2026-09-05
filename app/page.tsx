"use client";
// src/app/page.tsx

import { useState, useRef } from "react";
import FaceMeter from "./FaceMeter"; // ← ① 追加
import Recorder from "./Recorder";

export default function Home() {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [speaking, setSpeaking] = useState(false); // 読み上げ中かどうか
  const audioRef = useRef<HTMLAudioElement | null>(null); // 今鳴っている音声
  const [volume, setVolume] = useState(1); // 音量 0〜1
  const [rate, setRate] = useState(1); // 速さ 0.5〜2（1が普通）
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
  // async function speak() {
  //   const res = await fetch("/api/tts", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ text: feedback }),
  //   });
  //   const data = await res.json();
  //   const audio = new Audio("data:audio/mp3;base64," + data.audio);
  //   audio.play();
  // }
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
  return (
    <main style={{ padding: 24, maxWidth: 640 }}>
      <h1 className="text-xl font-bold font-mono">AI練習コーチ</h1>
      <div style={{ marginTop: 8 }} className="my-2"></div>
      <FaceMeter onScore={setSmileScore} />
      {/* <p>いまの笑顔率：{smileScore}%</p> */}

      {smileScore > 70 ? (
        <p>笑顔率{smileScore}% ：素晴らしい笑顔です👍</p>
      ) : smileScore > 30 && smileScore <= 70 ? (
        <p>笑顔率{smileScore}% ：良い感じです🆗</p>
      ) : (
        <p>笑顔率{smileScore}% ：頑張りましょう💪</p>
      )}

      <p className="my-2">お題：{topic}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={10}
        style={{ width: "100%" }}
        placeholder="1000 文字以内でここに回答を入力"
        maxLength={1000}
        className="my-2 focus:ring-1 w-auto border border-gray-300 h-20"
      />
      <p className="text-sm text-gray-500 my-2">{answer.length} / 1,000 文字</p>
      {/* textarea の下あたり */}
      <Recorder onText={(t) => setAnswer(t)} />

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 12 }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? "生成中…" : "コーチに見てもらう"}
        </button>
      </div>

      {feedback && (
        <>
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
                  style={{ marginLeft: 8 }}
                />
              </label>
            </div>
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
                  style={{ marginLeft: 8 }}
                />
              </label>
            </div>
          
        </>
      )}
    </main>
  );
}
