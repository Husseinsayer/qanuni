// ===== Test AI Connection API Route (server-side proxy) =====
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, model, provider } = body;

    if (!apiKey || typeof apiKey !== "string" || apiKey.length < 10) {
      return NextResponse.json({ success: false, error: "API Key مطلوب أو غير صالح" }, { status: 400 });
    }
    if (!provider || typeof provider !== "string") {
      return NextResponse.json({ success: false, error: "المزود (provider) مطلوب" }, { status: 400 });
    }
    if (model && typeof model !== "string") {
      return NextResponse.json({ success: false, error: "النموذج (model) غير صالح" }, { status: 400 });
    }

    if (provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: [
            { role: "system", content: "أنت مساعد قانوني عراقي." },
            { role: "user", content: "قل فقط: 'الاتصال ناجح ✅'" },
          ],
          max_tokens: 20,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const error = await response.text();
        let msg: string;
        if (response.status === 401) {
          msg = "مفتاح API غير صحيح. تأكد من أنك تستخدم مفتاح OpenAI صالح من https://platform.openai.com";
        } else if (response.status === 429) {
          msg = "رصيد API غير كافٍ (429). تحتاج إلى إضافة رصيد في https://platform.openai.com/account/billing";
        } else {
          msg = `OpenAI API: ${response.status} - ${error.slice(0, 200)}`;
        }
        return NextResponse.json({ success: false, error: msg });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      return NextResponse.json({ success: true, content: content.slice(0, 100) });
    }

    return NextResponse.json({ success: false, error: `المزود ${provider} غير مدعوم بعد` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطأ غير معروف";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
