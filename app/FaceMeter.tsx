"use client";
// src/app/FaceMeter.tsx

import { useEffect, useRef, useState } from "react";

type FaceMeterProps = {
  onScore?: (n: number) => void; // ← 1行追加（拡張前のバックアップ用）
  onHappy?: (n: number) => void;
  onSad?: (n: number) => void;
  onAngry?: (n: number) => void;
  onSurprised?: (n: number) => void;
  onNeutral?: (n: number) => void;
  onFearful?: (n: number) => void;
  onDisgusted?: (n: number) => void;
};

export default function FaceMeter({
  onHappy,
  onSad,
  onAngry,
  onSurprised,
  onNeutral,
  onFearful,
  onDisgusted,
}: FaceMeterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [smile, setSmile] = useState(0);
  const [sad, setSad] = useState(0);
  const [angry, setAngry] = useState(0);
  const [surprised, setSurprised] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [fearful, setFearful] = useState(0);
  const [disgusted, setDisgusted] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    let stream: MediaStream | null = null; // 片付けでカメラを止めるために保持
    let cancelled = false;                 // 片付け済みなら以降の処理をやめる印

    async function start() {
      // ① face-api を "ブラウザで動き始めてから" 読み込む（重要・下の⚠️参照）
      const faceapi = await import("@vladmandic/face-api");

      // ② モデルを読み込む（public/models から）
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      if (cancelled) return; // 読み込み中に画面を離れていたら、ここで終わる

      // ③ カメラを起動して video に流す
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop()); // 使わないので即止める
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // ← srcObject 代入だけだと再生されず真っ黒な環境がある
          // ← .catch() は「開発モードの2回実行」で出る AbortError を無視するため
          await videoRef.current.play().catch(() => {});
        }
      } catch (e) {
        console.error(e);
        alert("カメラを使えませんでした。ブラウザのアドレスバーでカメラを『許可』してから、ページを再読み込みしてください。");
        return;
      }

      // ④ 0.5秒ごとに表情を測る
      timer = setInterval(async () => {
        if (!videoRef.current) return;
        const result = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();
        if (result) {
          const happy = Math.round(result.expressions.happy * 100);
          const sad = Math.round(result.expressions.sad * 100);
          const angry = Math.round(result.expressions.angry * 100);
          const surprised = Math.round(result.expressions.surprised * 100);
          const neutral = Math.round(result.expressions.neutral * 100);
          const fearful = Math.round(result.expressions.fearful * 100);
          const disgusted = Math.round(result.expressions.disgusted * 100);

          setSmile(happy);
          setSad(sad);
          setAngry(angry);
          setSurprised(surprised);
          setNeutral(neutral);
          setFearful(fearful);
          setDisgusted(disgusted);

          // ★渡されているものだけ呼ぶ（?. = オプショナルチェイニング）
          onHappy?.(happy);
          onSad?.(sad);
          onAngry?.(angry);
          onSurprised?.(surprised);
          onNeutral?.(neutral);
          onFearful?.(fearful);
          onDisgusted?.(disgusted);
        }
      }, 500);
    }

    start();
    // 片付け（画面を離れたとき／開発モードの2回目実行の前に呼ばれる）
    return () => {
      cancelled = true;
      clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop()); // ★カメラを止める（ランプが消える）
    };
    // onHappy〜onDisgustedは常に同じ関数を渡す（インライン関数にすると毎回カメラが再起動するので注意）
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay muted playsInline width={320} height={240} />
      {/* <p>😊 笑顔 {smile}%</p>
      <p>😢 悲しみ {sad}%</p>
      <p>😠 怒り {angry}%</p>
      <p>😲 驚き {surprised}%</p>
      <p>😐 中立 {neutral}%</p>
      <p>😨 恐怖 {fearful}%</p>
      <p>🤢 嫌悪 {disgusted}%</p> */}
    </div>
  );
}