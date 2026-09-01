// src/app/api/transcribe/route.ts

  export async function POST(request: Request) {
    const inForm = await request.formData();
    const audio = inForm.get("audio") as File | null;

    // ① そもそも音が入っているか
    if (!audio || audio.size === 0) {
      return Response.json({ error: "音声が空です。録音できていません。" }, { status: 400 });
    }

    // ② Groqの音声API(Whisper)へ転送する形に詰め替える
    const groqForm = new FormData();
    // groqForm.append("file", audio, audio.name || "audio.webm");
    groqForm.append("file", audio, "audio.webm");
    groqForm.append("model", "whisper-large-v3-turbo");
    groqForm.append("language", "ja");

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: groqForm, // ← FormDataのときは Content-Type を自分で付けない
    });

    // ③ 失敗したら、理由が分かるように返す
    const data = await res.json();
    // if (!res.ok || typeof data.text !== "string") {
    //   console.error("Groq(Whisper)エラー:", data);
    //   return Response.json(
    //     { error: "文字起こしに失敗しました。ターミナルの赤い文字を確認してください。" },
    //     { status: 502 },
    //   );
    // }

    return Response.json({ text: data.text });
  }