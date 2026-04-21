// サーバー側プロキシ: APIキーをブラウザに晒さずにAnthropicへ中継する
// 環境変数 ANTHROPIC_API_KEY が設定されていればリアルAI、
// 設定されていなければデモモード（ダミーJSONを返す）で動きます。

const DEMO_RESPONSE = {
  parts: {
    eyes: "やや丸みを帯びた、印象的な目元の傾向があります。",
    eyebrows: "自然なアーチを描き、柔らかな印象。",
    nose: "鼻筋が通り、バランスの良い形の傾向。",
    mouth: "口角がやや上がり、親しみやすい印象。",
    ears: "顔全体とのバランスが整っている傾向。",
    balance: "パーツの配置に余裕があり、落ち着いた印象。",
    depth: "自然な陰影があり、ほどよい立体感があります。",
  },
  charm: "温かみのある自然体な表情が魅力です。",
  eightType: {
    primary: "フェミニン",
    axes: { age: "大人寄り", impression: "親しみ", line: "曲線" },
    note: "柔らかい印象と曲線的なラインが特徴的に見える傾向です。",
  },
  bone: {
    primary: "ウェーブ",
    breakdown: [
      { type: "ウェーブ", percentage: 55 },
      { type: "ストレート", percentage: 25 },
      { type: "ナチュラル", percentage: 20 },
    ],
    note: "首や肩の印象からの推測です。全身写真があるとより正確に判定できます。",
  },
  personalColor: {
    primary: "スプリング",
    undertone: "イエローベース",
    note: "肌の明るさと温かみのあるトーンから判定しました。",
    recommendedColors: ["コーラル", "ピーチ", "クリーム"],
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // デモモード：APIキーがなければダミー応答を返す
  if (!apiKey) {
    // 少し待ってリアルっぽく
    await new Promise((r) => setTimeout(r, 1500));
    return res.status(200).json({ demo: true, result: DEMO_RESPONSE });
  }

  try {
    const { image, prompt } = req.body;
    if (!image || !prompt) {
      return res.status(400).json({ error: "image and prompt required" });
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2500,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    const data = await anthropicRes.json();
    if (!anthropicRes.ok) {
      return res.status(anthropicRes.status).json({ error: data });
    }

    const text = data.content?.[0]?.text?.trim() || "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json({ demo: false, result: parsed });
  } catch (err) {
    console.error("AI API error:", err);
    // エラー時もデモ応答を返して、ユーザー体験を壊さない
    return res.status(200).json({ demo: true, error: String(err), result: DEMO_RESPONSE });
  }
}
