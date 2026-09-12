// src/app/api/coach/route.ts（この名前でないと API が動かない。Next.js の規則）
export async function POST(request: Request) {
  // ① 入力を受け取る（画面から送られてくる お題 と 回答）
  //   Body が空/JSONでない時に備えて、try で受け止める
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ feedback: "リクエストの形式が不正です（BrunoのBodyがJSONか確認してください）" }, { status: 400 });
  }
  const { topic, answer, tone } = body;

  // ①.5 最低限の入力チェック（空のまま送られてもAIに投げない）
  if (!topic || !answer || typeof answer !== "string") {
    return Response.json({ feedback: "回答を入力してください。" }, { status: 400 });
  }

  // ② AIへの"お願い文"を組み立てる
  const prompt = `あなたは就職エージェントです。
「${tone}」な口調で、次の「シチュエーション」に対する「回答」を読んで、
良かった点と改善点を、具体的に、100文字くらいで日本語でフィードバックしてください。
シチュエーション: ${topic}
回答: ${answer}`;

  // ③〜⑤ Groq を叩く〜画面に返す（通信失敗やAI側のエラーで落ちないよう try/catch で守る）
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    // ④ 返事を取り出す
    const data = await res.json();

    // Groqがエラーを返した時（キー違い・回数制限など）はここで気づける
    if (!res.ok || !data.choices?.[0]?.message?.content) {
      console.error("Groqエラー:", data);
      return Response.json(
        { feedback: "AIとの通信に失敗しました。ターミナルの赤い文字（キー違い・回数制限など）を確認してください。" },
        { status: 502 },
      );
    }

    const feedback = data.choices[0].message.content;

    // ⑤ 画面に返す
    return Response.json({ feedback });
  } catch (e) {
    // fetch自体が失敗した場合（ネットワーク瞬断・タイムアウトなど）
    console.error("予期しないエラー:", e);
    return Response.json(
      { feedback: "サーバー側で予期しないエラーが発生しました。時間をおいて再度お試しください。" },
      { status: 500 },
    );
  }
}
/try でやってみようという箱。fetch はそのやってみようの方法の一つ。catch はダメだった時の処理方法ということでしょうか？/ 