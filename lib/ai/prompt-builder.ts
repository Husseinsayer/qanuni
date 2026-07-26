// ===== Iraqi Legal Assistant - Prompt Builder =====
// Builds system prompts from BotInstructions settings
import type { BotInstructions, EnhancedSearchResult, QuestionClassification } from "./types";

export function buildSystemPrompt(instructions: BotInstructions): string {
  const parts: string[] = [];

  // Identity
  parts.push("أنت المساعد القانوني الذكي العراقي.");
  parts.push("مهمتك مساعدة المواطنين العراقيين في فهم القوانين العراقية والحصول على إجابة قانونية دقيقة.");
  parts.push("");

  // General behavior from instructions
  if (instructions.generalBehavior.trim()) {
    parts.push(instructions.generalBehavior.trim());
    parts.push("");
  }

  // Response style
  const styleMap = {
    formal: "استخدم لغة قانونية رسمية ومصطلحات قانونية دقيقة.",
    simplified: "استخدم لغة مبسطة وسهلة الفهم للمواطن العادي.",
    balanced: "كن متوازناً: ابدأ بلغة بسيطة ثم قدم التفاصيل القانونية.",
  };
  parts.push(`أسلوب الرد: ${styleMap[instructions.responseStyle]}`);
  parts.push("");

  // Language
  const langMap = {
    auto: "تكيف مع لغة المستخدم: استخدم الفصحى أو اللهجة العراقية حسب ما يستخدمه المستخدم.",
    fusha: "استخدم اللغة العربية الفصحى دائماً.",
    iraqi: "استخدم اللهجة العراقية دائماً.",
  };
  parts.push(`اللغة: ${langMap[instructions.languagePreference]}`);
  parts.push("");

  // Response length
  const lengthMap = {
    concise: "كن مختصراً: قدم الإجابة في فقرة واحدة لا تتجاوز 150 كلمة.",
    detailed: "قدم إجابة مفصلة مع شرح وتوضيح.",
    comprehensive: "قدم إجابة شاملة مع خطوات عملية وحالات مختلفة وتفصيل كامل.",
  };
  parts.push(`طول الرد: ${lengthMap[instructions.maxResponseLength]}`);
  parts.push("");

  // Response priority
  const priorityMap = {
    speed: "الأهمية للسرعة: قدم إجابة سريعة ومباشرة.",
    accuracy: "الأهمية للدقة: خذ وقتك لضمان أقصى دقة قانونية.",
    balanced: "حافظ على توازن بين السرعة والدقة.",
  };
  parts.push(`أولوية الرد: ${priorityMap[instructions.responsePriority]}`);
  parts.push("");

  // Citation
  const citeMap = {
    always: "اذكر المادة القانونية كدليل على كل معلومة تقدمها.",
    when_needed: "اذكر المواد القانونية عند الحاجة فقط.",
    never: "لا تذكر المواد القانونية في ردودك.",
  };
  parts.push(`الاستشهاد: ${citeMap[instructions.citationRequirement]}`);
  parts.push("");

  // Disclaimer
  if (instructions.showDisclaimer) {
    parts.push("تنبيه: أضف إخلاء مسؤولية في نهاية كل رد: 'هذه المعلومات لأغراض إرشادية فقط ولا تعتبر استشارة قانونية ملزمة. يرجى استشارة محامٍ مؤهل.'");
    parts.push("");
  }

  // Disallowed actions
  if (instructions.disallowedActions.length > 0) {
    parts.push("### ممنوعات (لا تفعل هذه أبداً):");
    for (const action of instructions.disallowedActions) {
      if (action.trim()) parts.push(`- ${action.trim()}`);
    }
    parts.push("");
  }

  // Restricted topics
  if (instructions.restrictedTopics.length > 0) {
    parts.push("### مواضيع ممنوعة (لا تفتح هذه المواضيع):");
    for (const topic of instructions.restrictedTopics) {
      if (topic.trim()) parts.push(`- ${topic.trim()}`);
    }
    parts.push("");
  }

  // Strict law only
  if (instructions.strictLawOnly) {
    parts.push("هام جداً: لا تستخدم أي معلومات إلا من القوانين العراقية فقط. لا تعطي إجابات عامة أو من خارج القانون العراقي.");
    parts.push("");
  }

  // Audience mode
  const audienceMap = {
    everyone: "ردودك موجهة للجميع: المواطنين العاديين والمحامين على حد سواء.",
    lawyers_only: "ردودك موجهة للمحامين فقط. استخدم المصطلحات القانونية المتخصصة.",
    both: "قدم إجابة تناسب الجميع، مع تفصيل قانوني إضافي للمحامين.",
  };
  parts.push(`الجمهور: ${audienceMap[instructions.audienceMode]}`);
  parts.push("");

  // Response features
  parts.push("### ميزات الرد المطلوبة:");
  if (instructions.askClarifyingQuestions) {
    parts.push("- إذا كانت المعلومات ناقصة، اسأل المستخدم أسئلة توضيحية (بحد أقصى " + instructions.maxClarifyingQuestions + " أسئلة).");
  }
  if (instructions.showPracticalSteps) {
    parts.push("- قدم خطوات عملية واضحة يمكن للمستخدم اتباعها.");
  }
  if (instructions.showAlternativeInterpretations) {
    parts.push("- إذا كان هناك اختلاف بين الفقهاء أو تفسيرات بديلة، اذكرها.");
  }
  if (instructions.showCourtProcedures) {
    parts.push("- اشرح الإجراءات القضائية وحدد المحكمة المختصة بالنظر في القضية.");
  }
  if (instructions.mentionUncertainty) {
    parts.push("- إذا لم تكن متأكداً بنسبة 100%، أشر إلى درجة ثقتك في الإجابة.");
  }
  if (instructions.referencePreviousConversations) {
    parts.push("- ارجع إلى المعلومات التي ذكرها المستخدم سابقاً في المحادثة.");
  }
  parts.push("");

  // Legal sources
  const sourcesMap = {
    laws_only: "اعتمد فقط على نصوص القوانين النافذة. لا تستخدم الأحكام القضائية.",
    laws_and_rulings: "اعتمد على القوانين النافذة والأحكام القضائية الصادرة من محكمة التمييز.",
    all: "اعتمد على القوانين والأحكام القضائية والآراء الفقهية المعتمدة.",
  };
  parts.push(`المصادر القانونية: ${sourcesMap[instructions.legalSources]}`);
  parts.push("");

  // Province differences
  if (instructions.mentionProvinceDifferences) {
    parts.push("عند الاقتضاء، اذكر إن كانت الممارسات القضائية تختلف بين المحافظات العراقية.");
    parts.push("");
  }

  // Urgent case detection
  if (instructions.urgentCaseDetection) {
    parts.push("إذا اكتشفت حالة عاجلة (توقيف، اعتقال، حبس، طارئ)، وجه المستخدم فوراً لاستشارة محامٍ وقدم نصائح عاجلة.");
    parts.push("");
  }

  // Human lawyer suggestion
  if (instructions.suggestHumanLawyer) {
    parts.push(`عندما تكون درجة الثقة أقل من ${instructions.escalationThreshold}%، اقترح على المستخدم استشارة محامٍ بشري مؤهل.`);
    parts.push("");
  }

  // Formatting instructions
  parts.push("### تنسيق الرد:");
  parts.push("1. ابدأ بالجواب المباشر.");
  parts.push("2. استخدم تنسيق Markdown للتنظيم (عناوين، نقاط، تشديد).");
  parts.push("3. اجعل الإجابة واضحة ومنظمة.");
  parts.push("4. لا تبدأ بعرض المواد القانونية - ابدأ بالجواب المباشر أولاً.");

  return parts.join("\n");
}

// ===== Search Context Builder (injected as a separate user message) =====
// Builds a focused search context block for the AI to use as its ONLY reference.
// This is NOT mixed into the system prompt — it's injected as a user message.
export function buildEnhancedPrompt(
  _userMessage: string,
  search: EnhancedSearchResult,
  classification: QuestionClassification
): string {
  const parts: string[] = [];

  // === CRITICAL: Mandatory instruction at the TOP ===
  parts.push("## المواد القانونية المتاحة (المصدر الوحيد للإجابة)");
  parts.push("");
  parts.push("**تنبيه مهم: الإجابة يجب أن تستند حصراً على المواد القانونية المذكورة أدناه.**");
  parts.push("لا تستخدم أي معلومات خارج هذه المواد. إذا لم تجد إجابة كافية، قل ذلك بوضوح.");
  parts.push("");

  // Classification context (brief)
  const typeLabels: Record<string, string> = {
    law_metadata: "معلومات عن قانون",
    article_content: "نص مادة قانونية",
    legal_rule: "حكم قانوني",
    procedure: "إجراءات قانونية",
    legal_definition: "تعريف قانوني",
    comparison: "مقارنة قانونية",
    explanation: "شرح قانوني",
    general: "استفسار عام",
  };
  parts.push(`**تصنيف السؤال:** ${typeLabels[classification.type] || "عام"}`);
  if (classification.lawName) {
    parts.push(`**القانون المعني:** ${classification.lawName}`);
  }
  if (classification.articleNum) {
    parts.push(`**المادة المطلوبة:** ${classification.articleNum}`);
  }
  parts.push("");

  // === Matched law metadata ===
  if (search.matchedLaw) {
    parts.push(`### القانون المطابق: ${search.matchedLaw.law.name}`);
    parts.push(`- عدد المواد: ${search.matchedLaw.law.articles}`);
    parts.push(`- آخر تحديث: ${search.matchedLaw.law.updated}`);
    parts.push(`- المصدر: ${search.matchedLaw.law.source || "الوقائع العراقية"}`);
    parts.push("");
  } else if (search.metadataMatches.length > 0) {
    parts.push(`### القوانين المطابقة للاستعلام:`);
    for (const m of search.metadataMatches.slice(0, 3)) {
      parts.push(`- ${m.law.name} (${m.law.articles} مادة)`);
    }
    parts.push("");
  }

  // === Article texts (the core evidence) ===
  if (search.articles.length > 0) {
    parts.push(`### نصوص المواد القانونية المسترجعة:`);
    parts.push("");
    for (const article of search.articles.slice(0, 8)) {
      parts.push(`**المادة ${article.articleNumber}** — ${article.lawName}`);
      parts.push(article.articleText);
      parts.push("");
    }
  }

  // === Knowledge Center context ===
  if (search.knowledgeContext) {
    parts.push(`### معلومات إضافية من مركز المعرفة:`);
    parts.push(search.knowledgeContext);
    parts.push("");
  }

  // === Final strict instruction ===
  parts.push("---");
  parts.push("**تعليمات صارمة للإجابة:**");
  parts.push("1. استخدم فقط المواد القانونية المذكورة أعلاه.");
  parts.push("2. ابدأ بالجواب المباشر ثم اذكر المواد.");
  parts.push("3. إذا لم توجد مادة قانونية تغطي السؤال، أخبر المستخدم بذلك صراحة.");
  parts.push("4. لا تختلق نصوصاً قانونية أو مواد غير موجودة.");
  parts.push("5. اذكر رقم المادة واسم القانون لكل معلومة.");
  parts.push("6. قدم الإجابة بطريقة واضحة بالعربية.");

  return parts.join("\n");
}
