import type { WizardData, HeirResult, CalculationResult } from "./types";

const LAW_NAME = "قانون الأحوال الشخصية العراقي رقم 188 لسنة 1959";

interface HeirEntry {
  key: string;
  relationship: string;
  name: string;
  gender: string;
  fraction: number;
  isResiduary: boolean;
  excludeReason: string;
  articleNumber: number;
  articleText: string;
}

function g(data: WizardData): "male" | "female" {
  return data.deceasedGender === "female" ? "female" : "male";
}

function hasDescendantsOrGrandsons(data: WizardData): boolean {
  return data.hasChildren || (data.deceasedSons > 0 && data.deceasedSonsChildren && data.deceasedSonsChildrenCount > 0);
}

function hasMaleDescendants(data: WizardData): boolean {
  if (data.sonsCount > 0) return true;
  if (data.deceasedSons > 0 && data.deceasedSonsChildren && data.deceasedSonsChildrenCount > 0) return true;
  return false;
}

function countDaughterShares(data: WizardData): number {
  if (!data.hasChildren) return 0;
  let total = data.daughtersCount;
  if (data.deceasedDaughters > 0) total += data.deceasedDaughters;
  return total;
}

function countSonShares(data: WizardData): number {
  if (!data.hasChildren) return 0;
  let total = data.sonsCount;
  if (data.deceasedSons > 0 && data.deceasedSonsChildren && data.deceasedSonsChildrenCount > 0) {
    total += data.deceasedSonsChildrenCount;
  }
  return total;
}

export function calculateInheritance(data: WizardData): CalculationResult {
  const result: CalculationResult = {
    status: "calculated",
    totalEstate: data.totalEstate,
    debts: data.debts.reduce((s, d) => s + d.value, 0),
    wills: data.wills.reduce((s, w) => s + w.value, 0),
    willDeduction: 0,
    netEstate: 0,
    heirs: [],
    excludedPersons: [],
    legalReferences: [],
    warnings: [],
    needsLawyer: false,
    lawyerReason: "",
  };

  if (data.totalEstate <= 0) {
    result.status = "needs_review";
    result.warnings.push("لم يتم تحديد قيمة التركة");
    return result;
  }

  if (data.hasUncertainInfo) {
    result.status = "needs_review";
    result.warnings.push("يوجد معلومات غير مؤكدة في الإجابات");
  }

  const totalDebts = result.debts;
  const netAfterDebts = Math.max(0, result.totalEstate - totalDebts);
  result.netEstate = netAfterDebts;

  const willLimit = netAfterDebts / 3;
  result.willDeduction = Math.min(result.wills, willLimit);
  if (result.wills > willLimit) {
    result.warnings.push(`الوصية تجاوزت الثلث، سيتم احتساب ${willLimit.toFixed(0)} دينار فقط (ثلث التركة الصافية)`);
  }
  result.netEstate = netAfterDebts - result.willDeduction;

  if (result.netEstate <= 0) {
    result.status = "needs_review";
    result.warnings.push("التركة لا تغطي الديون والوصايا");
    return result;
  }

  const netEstate = result.netEstate;
  const heirs: HeirEntry[] = [];
  const male = g(data);
  const hasDesc = hasDescendantsOrGrandsons(data);
  const hasMaleDesc = hasMaleDescendants(data);
  const daughterCount = countDaughterShares(data);
  const sonCount = countSonShares(data);

  const addHeir = (
    key: string,
    relationship: string,
    name: string,
    gender: string,
    fraction: number,
    isResiduary: boolean,
    articleNumber: number,
    articleText: string,
  ) => {
    heirs.push({ key, relationship, name, gender, fraction, isResiduary, excludeReason: "", articleNumber, articleText });
  };

  const addExcluded = (
    key: string,
    relationship: string,
    name: string,
    gender: string,
    reason: string,
    articleNumber: number,
    articleText: string,
  ) => {
    heirs.push({ key, relationship, name, gender, fraction: 0, isResiduary: false, excludeReason: reason, articleNumber, articleText });
  };

  // === SPOUSE ===
  if (data.hasSpouse) {
    const spouseGender = male === "male" ? "female" : "male";
    const spouseName = male === "male" ? "الزوجة" : "الزوج";
    let spouseFrac = 0;
    let articleText = "";

    if (hasDesc || daughterCount >= 2) {
      spouseFrac = male === "male" ? 1 / 8 : 1 / 4;
      articleText = "للزوج الثمن وللزوجة الربع إذا كانوا مع أولاد أو بنتين فما فوق";
    } else {
      spouseFrac = male === "male" ? 1 / 4 : 1 / 2;
      articleText = "للزوج الربع وللزوجة النصف إذا لم يكن مع أولاد أو بنتين فما فوق";
    }

    if (data.spouseCount > 1) {
      const perWife = spouseFrac / data.spouseCount;
      for (let i = 0; i < data.spouseCount; i++) {
        addHeir(
          `spouse_${i + 1}`,
          male === "male" ? "الزوجة" : "الزوج",
          male === "male" ? `الزوجة (${i + 1})` : "الزوج",
          spouseGender,
          perWife,
          false,
          403,
          articleText,
        );
      }
    } else {
      addHeir("spouse", spouseName, spouseName, spouseGender, spouseFrac, false, 403, articleText);
    }
  }

  // === CHILDREN ===
  if (data.hasChildren) {
    if (sonCount > 0 && daughterCount > 0) {
      const totalParts = sonCount * 2 + daughterCount;
      for (let i = 0; i < sonCount; i++) {
        addHeir(
          `son_${i + 1}`,
          "الابن",
          `الابن (${i + 1})`,
          "male",
          2 / totalParts,
          false,
          401,
          "للذكر مثل حظ الأنثيين في الميراث",
        );
      }
      for (let i = 0; i < daughterCount; i++) {
        addHeir(
          `daughter_${i + 1}`,
          "البنت",
          `البنت (${i + 1})`,
          "female",
          1 / totalParts,
          false,
          401,
          "للذكر مثل حظ الأنثيين في الميراث",
        );
      }
    } else if (sonCount > 0) {
      for (let i = 0; i < sonCount; i++) {
        addHeir(
          `son_${i + 1}`,
          "الابن",
          `الابن (${i + 1})`,
          "male",
          0,
          true,
          402,
          "العصبات هم الورثة بال残ر (الابن عصبة)",
        );
      }
    } else if (daughterCount === 1) {
      addHeir("daughter", "البنت", "البنت", "female", 1 / 2, false, 401, "للبنت الواحدة النصف");
    } else if (daughterCount >= 2) {
      addHeir("daughters", `${daughterCount} بنات`, `${daughterCount} بنات`, "female", 2 / 3, false, 401, "لابنتين فما فوق الثلثان");
    }
  }

  // === DECEASED SON'S CHILDREN (Grandchildren by representation) ===
  if (data.deceasedSons > 0 && data.deceasedSonsChildren && data.deceasedSonsChildrenCount > 0 && !data.hasChildren) {
    for (let i = 0; i < data.deceasedSonsChildrenCount; i++) {
      addHeir(
        `grandson_son_${i + 1}`,
        "حفيد من الابن",
        `حفيد من الابن (${i + 1})`,
        "male",
        daughterCount > 0 ? 0 : 0,
        daughterCount === 0,
        401,
        "يأخذ الحفيد نصيب أبيه بال😢اس (الحجب بالabolition)",
      );
    }
  }

  // === FATHER ===
  if (data.fatherAlive) {
    if (hasDesc) {
      addHeir("father", "الأب", "الأب", "male", 1 / 6, false, 404, "للب السدس إذا كان مع أولاد");
    } else {
      addHeir("father", "الأب", "الأب", "male", 0, true, 404, "الأب عصبة معقلة يأخذ ما بقي بعد الفروض");
    }
  } else if (data.fatherDeceasedBefore) {
    addExcluded("father", "الأب", "الأب", "male", "متوفى قبل المتوفى", 404, "الأب عصبة معقولة");
  }

  // === MOTHER ===
  if (data.motherAlive) {
    const maternalSiblingsCount = data.maternalBrothers + data.maternalSisters;
    if (hasDesc) {
      addHeir("mother", "الأم", "الأم", "female", 1 / 6, false, 405, "للأم السدس إذا كان مع أولاد");
    } else if (maternalSiblingsCount === 0) {
      addHeir("mother", "الأم", "الأم", "female", 1 / 3, false, 405, "للأم الثلث إذا لم يكن مع أولاد");
    } else if (maternalSiblingsCount === 1) {
      addHeir("mother", "الأم", "الأم", "female", 1 / 6, false, 405, "للأم السدس مع الأخ لأم");
    } else {
      addHeir("mother", "الأم", "الأم", "female", 1 / 6, false, 405, "للأم السدس مع الأخوة الأشقاء");
    }
  } else if (data.motherDeceasedBefore) {
    addExcluded("mother", "الأم", "الأم", "female", "توفيت قبل المتوفى", 405, "الأم لا ترث إذا توفيت قبل المتوفى");
  }

  // === PATERNAL GRANDFATHER ===
  if (data.hasGrandparents && data.paternalGrandfather) {
    if (hasDesc) {
      addExcluded("paternal_grandfather", "الجد لأب", "الجد لأب", "male", "تحجب بالأب", 409, "الجد تحجب بالabolition إذا كان الأب حياً");
    } else if (data.fatherAlive) {
      addExcluded("paternal_grandfather", "الجد لأب", "الجد لأب", "male", "تحجب بالأب", 409, "الجد تحجب بالabolition إذا كان الأب حياً");
    } else {
      addHeir("paternal_grandfather", "الجد لأب", "الجد لأب", "male", 1 / 6, true, 409, "الجد لأب يأخذ السدس ويكون عصبة معقولة");
    }
  }

  // === MATERNAL GRANDFATHER ===
  if (data.hasGrandparents && data.maternalGrandfather) {
    if (hasDesc) {
      addExcluded("maternal_grandfather", "الجد لأم", "الجد لأم", "male", "تحجب بالأم", 410, "الجد لأم تحجب بالأم");
    } else {
      addHeir("maternal_grandfather", "الجد لأم", "الجد لأم", "male", 1 / 6, false, 410, "الجد لأم يأخذ السدس");
    }
  }

  // === PATERNAL GRANDMOTHER ===
  if (data.hasGrandparents && data.paternalGrandmother) {
    if (data.fatherAlive) {
      addExcluded("paternal_grandmother", "الجدة لأب", "الجدة لأب", "female", "تحجب بالأب", 411, "الجدة لأب تحجب بالabolition");
    } else {
      addHeir("paternal_grandmother", "الجدة لأب", "الجدة لأب", "female", 1 / 6, false, 411, "الجدة لأب تأخذ السدس");
    }
  }

  // === MATERNAL GRANDMOTHER ===
  if (data.hasGrandparents && data.maternalGrandmother) {
    if (data.motherAlive) {
      addExcluded("maternal_grandmother", "الجدة لأم", "الجدة لأم", "female", "تحجب بالأم", 412, "الجدة لأم تحجب بالأم");
    } else {
      addHeir("maternal_grandmother", "الجدة لأم", "الجدة لأم", "female", 1 / 6, false, 412, "الجدة لأم تأخذ السدس");
    }
  }

  // === FULL BROTHERS ===
  if (data.hasSiblings) {
    for (let i = 0; i < data.fullBrothers; i++) {
      if (hasMaleDesc || data.fatherAlive || (data.hasGrandparents && data.paternalGrandfather)) {
        addExcluded(
          `full_brother_${i + 1}`,
          "الأخ الشقيق",
          `الأخ الشقيق (${i + 1})`,
          "male",
          hasMaleDesc ? "تحجب بالabolition (ابن أو حفيد ذكر)" : "تحجب بالأب أو الجد",
          407,
          "الأخ الشقيق تحجب بالabolition والأب والجد",
        );
      } else {
        addHeir(
          `full_brother_${i + 1}`,
          "الأخ الشقيق",
          `الأخ الشقيق (${i + 1})`,
          "male",
          0,
          true,
          408,
          "الإخوة عصبات يحبسون بمن يحجبهم",
        );
      }
    }

    for (let i = 0; i < data.fullSisters; i++) {
      if (hasMaleDesc || data.fatherAlive || (data.hasGrandparents && data.paternalGrandfather)) {
        addExcluded(
          `full_sister_${i + 1}`,
          "الأخت الشقيقة",
          `الأخت الشقيقة (${i + 1})`,
          "female",
          hasMaleDesc ? "تحجب بالabolition (ابن أو حفيد ذكر)" : "تحجب بالأب أو الجد",
          407,
          "الأخت الشقيقة تحجب بالabolition والأب والجد",
        );
      } else if (daughterCount === 0 && data.fullSisters === 1) {
        addHeir(
          `full_sister_${i + 1}`,
          "الأخت الشقيقة",
          `الأخت الشقيقة (${i + 1})`,
          "female",
          1 / 2,
          false,
          407,
          "للأخت الشقيقة النصف إذا لم يكن أولاد",
        );
      } else if (daughterCount === 0 && data.fullSisters >= 2) {
        addHeir(
          `full_sister_${i + 1}`,
          "الأخت الشقيقة",
          `الأخت الشقيقة (${i + 1})`,
          "female",
          0,
          true,
          407,
          "للأخت الشقيقة الثلثان (تعصب)",
        );
      } else {
        addExcluded(
          `full_sister_${i + 1}`,
          "الأخت الشقيقة",
          `الأخت الشقيقة (${i + 1})`,
          "female",
          "تحجب بالabolition أو تأخذ مع البنات",
          407,
          "الأخت الشقيقة مع البنات تحجب أو تأخذ السدس",
        );
      }
    }

    // === PATERNAL BROTHERS ===
    for (let i = 0; i < data.paternalBrothers; i++) {
      if (hasMaleDesc || data.fatherAlive || (data.hasGrandparents && data.paternalGrandfather)) {
        addExcluded(
          `paternal_brother_${i + 1}`,
          "الأخ لأب",
          `الأخ لأب (${i + 1})`,
          "male",
          "تحجب بالabolition أو الأب أو الجد",
          407,
          "الأخ لأب تحجب بالabolition والأب والجد",
        );
      } else {
        addHeir(
          `paternal_brother_${i + 1}`,
          "الأخ لأب",
          `الأخ لأب (${i + 1})`,
          "male",
          0,
          true,
          408,
          "الإخوة لأب عصبات",
        );
      }
    }

    // === PATERNAL SISTERS ===
    for (let i = 0; i < data.paternalSisters; i++) {
      if (hasMaleDesc || data.fatherAlive || (data.hasGrandparents && data.paternalGrandfather)) {
        addExcluded(
          `paternal_sister_${i + 1}`,
          "الأخت لأب",
          `الأخت لأب (${i + 1})`,
          "female",
          "تحجب بالabolition أو الأب أو الجد",
          407,
          "الأخت لأب تحجب بالabolition والأب والجد",
        );
      } else if (data.fullBrothers === 0 && data.paternalSisters === 1) {
        addHeir(
          `paternal_sister_${i + 1}`,
          "الأخت لأب",
          `الأخت لأب (${i + 1})`,
          "female",
          1 / 2,
          false,
          407,
          "للأخت لأب النصف إذا لم يكن أولاد",
        );
      } else if (data.fullBrothers === 0 && data.paternalSisters >= 2) {
        addHeir(
          `paternal_sister_${i + 1}`,
          "الأخت لأب",
          `الأخت لأب (${i + 1})`,
          "female",
          0,
          true,
          407,
          "للأخت لأب الثلثان (تعصب)",
        );
      } else {
        addExcluded(
          `paternal_sister_${i + 1}`,
          "الأخت لأب",
          `الأخت لأب (${i + 1})`,
          "female",
          "تحجب بالabolition",
          407,
          "الأخت لأب تحجب بالabolition",
        );
      }
    }

    // === MATERNAL SIBLINGS ===
    const maternalCount = data.maternalBrothers + data.maternalSisters;
    for (let i = 0; i < data.maternalBrothers; i++) {
      if (hasDesc) {
        const perPerson = Math.min(1 / 6, 1 / 3 / maternalCount);
        addHeir(
          `maternal_brother_${i + 1}`,
          "الأخ لأم",
          `الأخ لأم (${i + 1})`,
          "male",
          perPerson,
          false,
          406,
          "للأママيين السدس مع الأولاد (الحد الأقصى الثلث)",
        );
      } else if (maternalCount === 1) {
        addHeir(
          `maternal_brother_${i + 1}`,
          "الأخ لأم",
          `الأخ لأم (${i + 1})`,
          "male",
          1 / 3,
          false,
          406,
          "للأمامي الواحد الثلث إذا لم يكن مع أولاد",
        );
      } else {
        addHeir(
          `maternal_brother_${i + 1}`,
          "الأخ لأم",
          `الأخ لأم (${i + 1})`,
          "male",
          1 / 3 / maternalCount,
          false,
          406,
          "للأماميين الثلث بالتساوي بينهم",
        );
      }
    }

    for (let i = 0; i < data.maternalSisters; i++) {
      if (hasDesc) {
        const perPerson = Math.min(1 / 6, 1 / 3 / maternalCount);
        addHeir(
          `maternal_sister_${i + 1}`,
          "الأخت لأم",
          `الأخت لأم (${i + 1})`,
          "female",
          perPerson,
          false,
          406,
          "للأماميين السدس مع الأولاد (الحد الأقصى الثلث)",
        );
      } else if (maternalCount === 1) {
        addHeir(
          `maternal_sister_${i + 1}`,
          "الأخت لأم",
          `الأخت لأم (${i + 1})`,
          "female",
          1 / 3,
          false,
          406,
          "للأمامية الواحدة الثلث إذا لم يكن مع أولاد",
        );
      } else {
        addHeir(
          `maternal_sister_${i + 1}`,
          "الأخت لأم",
          `الأخت لأم (${i + 1})`,
          "female",
          1 / 3 / maternalCount,
          false,
          406,
          "للأماميات الثلث بالتساوي بينهم",
        );
      }
    }
  }

  // === PROCESS HEIRS ===
  const calculatedHeirs: HeirResult[] = [];
  const excludedPersons: HeirResult[] = [];

  let fixedSharesTotal = 0;
  const fixedHeirs: HeirEntry[] = [];
  const residuaryHeirs: HeirEntry[] = [];

  for (const heir of heirs) {
    if (heir.excludeReason) {
      excludedPersons.push({
        relationship: heir.relationship,
        name: heir.name,
        gender: heir.gender,
        isAlive: true,
        fraction: "",
        percentage: 0,
        amount: 0,
        isExcluded: true,
        excludeReason: heir.excludeReason,
        legalBasis: heir.articleText,
        lawName: LAW_NAME,
        articleNumber: heir.articleNumber,
        articleText: heir.articleText,
      });
    } else if (heir.isResiduary) {
      residuaryHeirs.push(heir);
    } else {
      fixedHeirs.push(heir);
      fixedSharesTotal += heir.fraction;
    }
  }

  const refMap = new Map<number, { lawId: string; lawName: string; articleNumber: number; articleText: string }>();

  for (const heir of fixedHeirs) {
    const pct = heir.fraction * 100;
    const amount = heir.fraction * netEstate;

    calculatedHeirs.push({
      relationship: heir.relationship,
      name: heir.name,
      gender: heir.gender,
      isAlive: true,
      fraction: fractionToString(heir.fraction),
      percentage: Math.round(pct * 100) / 100,
      amount: Math.round(amount),
      isExcluded: false,
      excludeReason: "",
      legalBasis: heir.articleText,
      lawName: LAW_NAME,
      articleNumber: heir.articleNumber,
      articleText: heir.articleText,
    });

    if (!refMap.has(heir.articleNumber)) {
      refMap.set(heir.articleNumber, {
        lawId: "personal_status",
        lawName: LAW_NAME,
        articleNumber: heir.articleNumber,
        articleText: heir.articleText,
      });
    }
  }

  const fixedTotal = fixedSharesTotal;
  const remaining = Math.max(0, 1 - fixedTotal);
  const residuaryCount = residuaryHeirs.length;

  if (residuaryCount > 0 && remaining > 0) {
    const perResiduary = remaining / residuaryCount;
    for (const heir of residuaryHeirs) {
      const amount = perResiduary * netEstate;
      const pct = perResiduary * 100;

      calculatedHeirs.push({
        relationship: heir.relationship,
        name: heir.name,
        gender: heir.gender,
        isAlive: true,
        fraction: "باقي",
        percentage: Math.round(pct * 100) / 100,
        amount: Math.round(amount),
        isExcluded: false,
        excludeReason: "",
        legalBasis: heir.articleText,
        lawName: LAW_NAME,
        articleNumber: heir.articleNumber,
        articleText: heir.articleText,
      });

      if (!refMap.has(heir.articleNumber)) {
        refMap.set(heir.articleNumber, {
          lawId: "personal_status",
          lawName: LAW_NAME,
          articleNumber: heir.articleNumber,
          articleText: heir.articleText,
        });
      }
    }
  } else if (residuaryCount > 0 && remaining <= 0) {
    for (const heir of residuaryHeirs) {
      excludedPersons.push({
        relationship: heir.relationship,
        name: heir.name,
        gender: heir.gender,
        isAlive: true,
        fraction: "",
        percentage: 0,
        amount: 0,
        isExcluded: true,
        excludeReason: "لم يتبقَّ شيء بعد الفروض (الجميع استوفوا حصتهم)",
        legalBasis: heir.articleText,
        lawName: LAW_NAME,
        articleNumber: heir.articleNumber,
        articleText: heir.articleText,
      });
    }
  }

  const totalFixedPct = calculatedHeirs
    .filter((h) => !h.isExcluded && h.fraction !== "باقي")
    .reduce((sum, h) => sum + h.percentage, 0);

  if (totalFixedPct > 100.01) {
    result.status = "needs_review";
    result.warnings.push(
      `مجموع النسب الفرضية (${totalFixedPct.toFixed(1)}%) يتجاوز 100% — قد تكون هناك حالة حجب أو تداخل غير محسوب`,
    );
  }

  if (fixedTotal > 1 && residuaryCount > 0) {
    result.status = "needs_review";
    result.warnings.push("مجموع الفروض يتجاوز التركة — العصبات لن يأخذوا شيئاً");
  }

  result.heirs = calculatedHeirs;
  result.excludedPersons = excludedPersons;
  result.legalReferences = Array.from(refMap.values());

  if (data.specialCases.length > 0) {
    const complexCases = ["unknown_heir", "disputed_paternity", "pending_litigation", "foreign_national"];
    const hasComplex = data.specialCases.some((c) => complexCases.includes(c.type));
    if (hasComplex) {
      result.status = "needs_lawyer";
      result.needsLawyer = true;
      result.lawyerReason = "الحالة تتطلب مراجعة قانونية متخصصة بسبب وجود حالات معقدة";
    }
  }

  if (data.hasChildren && data.sonsCount === 0 && data.daughtersCount === 1) {
    const daughterHeir = result.heirs.find((h) => h.relationship === "البنت");
    if (daughterHeir && daughterHeir.percentage === 50) {
      const fatherHeir = result.heirs.find((h) => h.relationship === "الأب" && !h.isExcluded);
      if (fatherHeir) {
        const fatherResidual = netEstate - daughterHeir.amount - result.heirs
          .filter((h) => h.relationship !== "الأب" && !h.isExcluded)
          .reduce((sum, h) => sum + h.amount, 0);
        if (fatherResidual > 0) {
          fatherHeir.amount = fatherResidual;
          fatherHeir.percentage = Math.round((fatherResidual / netEstate) * 100 * 100) / 100;
          fatherHeir.fraction = "باقي (عَوْض)";
          fatherHeir.legalBasis = "الأب عصبة معقولة — يأخذ باقي التركة بعد نصيب البنت الواحدة";
        }
      }
    }
  }

  if (result.heirs.length === 0 && result.excludedPersons.length === 0) {
    result.status = "needs_review";
    result.warnings.push("لم يتم تحديد أي وارث — تأكد من صحة البيانات المدخلة");
  }

  return result;
}

function fractionToString(frac: number): string {
  const common: [number, string][] = [
    [1 / 2, "1/2"],
    [1 / 3, "1/3"],
    [1 / 4, "1/4"],
    [1 / 6, "1/6"],
    [1 / 8, "1/8"],
    [2 / 3, "2/3"],
    [1, "1"],
  ];

  for (const [val, str] of common) {
    if (Math.abs(frac - val) < 0.0001) return str;
  }

  for (let d = 2; d <= 12; d++) {
    const n = Math.round(frac * d);
    if (Math.abs(frac - n / d) < 0.0001) {
      return `${n}/${d}`;
    }
  }

  return `${(frac * 100).toFixed(1)}%`;
}
