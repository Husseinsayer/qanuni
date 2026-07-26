import { SectionTitle, Card } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { Building2, Target, ShieldCheck, Users, Scale, Globe } from "lucide-react";

const stats = [
  { value: "8+", label: "مجالات قانونية" },
  { value: "5000+", label: "محامٍ موثّق" },
  { value: "100K+", label: "مادة قانونية" },
  { value: "24/7", label: "دعم متاح" },
];

const principles = [
  {
    icon: ShieldCheck,
    title: "الموثوقية أولاً",
    desc: "نعتمد المصادر الرسمية ونحقق من رخص المحامين قبل نشر أي ملف، لأن ثقة المواطن هي أساس عملنا.",
  },
  {
    icon: Target,
    title: "القانون في متناول الجميع",
    desc: "نبسط المصطلحات القانونية المعقدة ونجعل البحث عن التشريع والمحامي مسألة دقائق لا ساعات.",
  },
  {
    icon: Users,
    title: "خدمة إنسانية",
    desc: "خلف كل قضية إنسان؛ لذلك نضع خصوصية المستخدم وراحته في مقدمة كل ما نبنيه.",
  },
];

export function AboutIntro() {
  return (
    <>
      {/* Story */}
      <section className="py-16 md:py-20">
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="absolute -right-6 -top-6 size-40 rounded-3xl bg-accent/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary to-accent p-8 text-white shadow-premium">
                <Scale className="size-10 text-gold" />
                <h3 className="mt-4 text-2xl font-extrabold">قصة قانوني</h3>
                <p className="mt-3 leading-relaxed text-white/85">
                  وُلدت فكرة منصة قانوني من حاجة يومية يلمسها المواطن العراقي: التنقّل بين تشريعات متفرقة
                  والبحث عن محامٍ موثوق في وقت الأزمات. جمعنا بين خبرة القانونيين والتقنية لبناء منصة عربية
                  عراقية تضع القانون في متناول اليد.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-5">
              <span className="inline-block rounded-full bg-accent/10 px-4 py-1 text-sm font-semibold text-accent">
                رؤيتنا ورسالتنا
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                نعمل لخدمة العدالة في العراق
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                رسالتنا تمكين كل مواطن عراقي من معرفة حقوقه والوصول إلى أفضل المحامين بشفافية ويسر. ونطمح أن
                تكون قانوني المرجع الأول للمعلومة القانونية الموثوقة في العراق والمنطقة.
              </p>
              <ul className="space-y-3 pt-2">
                {principles.map((p) => {
                  const Icon = p.icon;
                  return (
                    <li key={p.title} className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <p className="font-bold">{p.title}</p>
                        <p className="text-sm text-muted-foreground">{p.desc}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-muted/30 py-14">
        <div className="container">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05}>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-extrabold text-accent md:text-4xl">{s.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-16 md:py-20">
        <div className="container">
          <SectionTitle
            eyebrow="تغطيتنا"
            title="نغطي أبرز المجالات القانونية العراقية"
            subtitle="من الأحوال الشخصية إلى قانون الاستثمار، تجد التشريع والمختص في مكان واحد"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Scale, t: "القانون المدني والعقاري" },
              { icon: ShieldCheck, t: "قانون العقوبات والجنائي" },
              { icon: Users, t: "الأحوال الشخصية والأسرة" },
              { icon: Building2, t: "الشركات والاستثمار" },
              { icon: Globe, t: "قانون العمل والهجرة" },
              { icon: Target, t: "القضايا الإدارية والتجارية" },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <Reveal key={c.t} delay={i * 0.04}>
                  <Card className="card-hover flex items-center gap-3 p-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-secondary to-accent text-white">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-semibold">{c.t}</span>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
