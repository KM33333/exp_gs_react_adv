// src/app/api/coach/route.ts
export async function POST(request: Request) {
  const { topic, answer, smileScore, sadScore, angryScore, surprisedScore, neutralScore, fearfulScore, disgustedScore } = await request.json();

  const prompt = `あなたはカウンセラーです。
次の「お題」に対する「回答」をと、表情のスコアを確認して、良かった点と改善点を、
やさしく具体的に、100文字くらいで日本語でフィードバックしてください。
お題: ${topic}
回答: ${answer}
笑顔率: ${smileScore}%
悲しみ率: ${sadScore}%
怒り率: ${angryScore}%
驚き率: ${surprisedScore}%
中立率: ${neutralScore}%
恐怖率: ${fearfulScore}%
嫌悪率: ${disgustedScore}%`
;

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

  const data = await res.json();
  const feedback = data.choices[0].message.content;
  return Response.json({ feedback });
}