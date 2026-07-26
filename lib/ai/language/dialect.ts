// ===== Iraqi Legal Assistant - Iraqi Dialect Detection =====

// === Iraqi Dialect Indicators ===
const iraqiIndicators = {
  // Common Iraqi words/particles
  words: [
    "شلونك", "شلونج", "شلونكم",
    "هلا", "اهلن",
    "زين", "كويس", "ϛνب",
    "والله", "واللهي",
    "ايه", "اي", "أي",
    "لا", "لأ",
    "بس", "بس هيك",
    "هسه", "هلاك",
    "ماشي", "ما اريد", "ما أريد",
    "ريد", "أريد",
    "اكتب", "اشرح",
    "شكو", "شكو ماكو",
    "ماكو", "اكو",
    "هيج", "هكذا",
    "اها", "اوه",
    "تمام", "زبط",
    "روح", "روحه",
    "شدعوه", "شدعوة",
    "خوش", "حلو",
    "عفية", "عفيه",
    "تسلم", "الله يسلمك",
    "يعطيك العافيه", "الله يعافيك",
    "الحمدلله", "ما شاء الله",
    "ان شاء الله", "يا ربي",
  ],

  // Common patterns (regex)
  patterns: [
    /شلون[كجن]/,           // شلونك/شلونج/شلون
    /هسه\s/,                // هسه (الآن)
    /ماكو\s/,               // ماكو (لا يوجد)
    /اكو\s/,                // اكو (يوجد)
    /ري[دд]\s/,             // ريد/ريد (أريد)
    /اكتب\s/,              // اكتب
    /هيج\s/,               // هيج (هكذا)
    /شكو\s/,               // شكو (لماذا)
    /خوش\s/,               // خوش (جيد)
    /تمام\s/,              // تمام
    /[؟?]\s*$/,            // علامة استفهام عراقية
  ],

  // Formal Arabic indicators (for contrast)
  formalWords: [
    "كيف حالك", "أهلاً وسهلاً",
    "أريد", "أرجو", "يُرجى",
    "هل يمكن", "هل يجوز",
    "شكراً جزيلاً", "أشكركم",
    "مع خالص التحيات",
    "وتفضلوا بقبول فائق الاحترام",
  ],
};

// === Detection Result ===
export type DialectResult = {
  dialect: "ar-iq" | "ar";
  confidence: number;
  indicators: string[];
};

// === Main Detection Function ===
export function detectDialect(text: string): DialectResult {
  const textLower = text.toLowerCase().trim();
  const indicators: string[] = [];
  let iraqiScore = 0;
  let formalScore = 0;

  // Check Iraqi words
  for (const word of iraqiIndicators.words) {
    if (textLower.includes(word.toLowerCase())) {
      iraqiScore += 2;
      indicators.push(` Iraqi word: "${word}"`);
    }
  }

  // Check Iraqi patterns
  for (const pattern of iraqiIndicators.patterns) {
    if (pattern.test(textLower)) {
      iraqiScore += 3;
      indicators.push(`Iraqi pattern: ${pattern.source}`);
    }
  }

  // Check formal Arabic
  for (const word of iraqiIndicators.formalWords) {
    if (textLower.includes(word.toLowerCase())) {
      formalScore += 2;
      indicators.push(`Formal word: "${word}"`);
    }
  }

  // Calculate confidence
  const total = iraqiScore + formalScore;
  const confidence = total > 0 ? Math.round((iraqiScore / total) * 100) : 50;

  return {
    dialect: iraqiScore > formalScore ? "ar-iq" : "ar",
    confidence,
    indicators,
  };
}

// === Get Response Style Based on Dialect ===
export function getResponseStyle(dialect: "ar-iq" | "ar"): {
  greeting: string;
  confirmation: string;
  question: string;
  thanks: string;
  goodbye: string;
} {
  if (dialect === "ar-iq") {
    return {
      greeting: "هلا وغلا! شلونك؟",
      confirmation: "ايه تمام",
      question: "شكو؟",
      thanks: "الله يعطيك العافيه",
      goodbye: "الله معاك، في أمان الله",
    };
  }

  return {
    greeting: "مرحباً بك! كيف حالك؟",
    confirmation: "نعم، صحيح",
    question: "ما هو الاستفسار؟",
    thanks: "شكراً جزيلاً",
    goodbye: "في أمان الله، مع السلامة",
  };
}
