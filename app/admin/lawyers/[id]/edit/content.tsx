"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../../../admin-context";
import { ArrowRight, Save, MessageCircle, Camera } from "lucide-react";
import { toast } from "@/lib/admin-toast";
import { getExtByLawyerId } from "@/lib/lawyer-profiles";

const hueOptions = [
  "from-blue-600 to-indigo-700",
  "from-amber-500 to-orange-600",
  "from-slate-700 to-slate-900",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-cyan-600",
  "from-purple-500 to-fuchsia-600",
  "from-indigo-600 to-blue-700",
  "from-rose-500 to-pink-600",
  "from-red-500 to-rose-600",
  "from-teal-500 to-emerald-600",
];

export default function EditLawyerPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data, update } = useAdminContext();
  const [dbLawyer, setDbLawyer] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  const existing = data.lawyers.find((l) => l.id === id);

  // Fetch from DB if not found in adminData
  useEffect(() => {
    if (existing) { setLoadingDb(false); return; }
    fetch(`/api/lawyer/${id}`)
      .then((res) => res.ok ? res.json() : null)
      .then((d) => { if (d) setDbLawyer(d); setLoadingDb(false); })
      .catch(() => setLoadingDb(false));
  }, [id, existing]);

  const src = existing || (dbLawyer ? {
    name: dbLawyer.name || dbLawyer.user?.name || "",
    slug: dbLawyer.slug || "",
    city: dbLawyer.city || "",
    specialization: dbLawyer.specialization || "",
    experience: dbLawyer.experience || 0,
    rating: dbLawyer.rating || 0,
    reviews: dbLawyer.reviewCount || 0,
    price: dbLawyer.price || 0,
    online: dbLawyer.online || false,
    verified: dbLawyer.verified || false,
    gender: dbLawyer.gender || "male",
    initials: dbLawyer.initials || "",
    hue: dbLawyer.hue || hueOptions[0],
    bio: dbLawyer.bio || "",
    languages: (() => { try { return JSON.parse(dbLawyer.languages || "[]"); } catch { return ["العربية"]; } })(),
    whatsapp: dbLawyer.whatsapp || "",
    telegram: dbLawyer.telegram || "",
    facebook: dbLawyer.facebook || "",
    instagram: dbLawyer.instagram || "",
    email: dbLawyer.user?.email || "",
    password: "",
    photoUrl: dbLawyer.photoUrl || "",
    points: dbLawyer.points || 0,
  } : null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState(5);
  const [price, setPrice] = useState(30);
  const [online, setOnline] = useState(true);
  const [verified, setVerified] = useState(false);
  const [gender, setGender] = useState("male");
  const [initials, setInitials] = useState("");
  const [hue, setHue] = useState(hueOptions[0]);
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState<string[]>(["العربية"]);
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [points, setPoints] = useState(0);

  // Initialize form when src is available
  useEffect(() => {
    if (src) {
      setName(src.name || "");
      setSlug(src.slug || "");
      setCity(src.city || data.cities[0] || "بغداد");
      setSpecialization(src.specialization || data.specializations[0] || "القانون المدني");
      setExperience(src.experience ?? 5);
      setPrice(src.price ?? 30);
      setOnline(src.online ?? true);
      setVerified(src.verified ?? false);
      setGender(src.gender || "male");
      setInitials(src.initials || "");
      setHue(src.hue || hueOptions[0]);
      setBio(src.bio || "");
      setLanguages(src.languages || ["العربية"]);
      setWhatsapp(src.whatsapp || "");
      setTelegram(src.telegram || "");
      setFacebook(src.facebook || "");
      setInstagram(src.instagram || "");
      setEmail(src.email || "");
      setPassword(src.password || "");
      setPhotoUrl(src.photoUrl || "");
      setPoints(src.points ?? 0);
    }
  }, [src, data.cities, data.specializations]);

  const computedRating = useMemo(() => {
    if (!id) return src?.rating ?? 0;
    const ext = getExtByLawyerId(id);
    const reviews = ext?.reviews || [];
    if (reviews.length === 0) return src?.rating ?? 0;
    return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
  }, [id, src?.rating]);

  const computedReviews = useMemo(() => {
    if (!id) return src?.reviews ?? 0;
    const ext = getExtByLawyerId(id);
    return ext?.reviews?.length ?? src?.reviews ?? 0;
  }, [id, src?.reviews]);

  if (loadingDb) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!src) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-lg text-muted-foreground">لم يتم العثور على المحامي</p>
        <Link href="/admin/lawyers">
          <Button variant="outline">
            <ArrowRight className="h-4 w-4" />
            العودة إلى المحامين
          </Button>
        </Link>
      </div>
    );
  }

  const toggleLang = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error("الاسم مطلوب", "يرجى إدخال اسم المحامي");
      return;
    }

    // If lawyer exists in adminData, update there
    if (existing) {
      update(
        "lawyers",
        data.lawyers.map((l) =>
          l.id === id
            ? {
                ...l,
                name: name.trim(),
                slug,
                city,
                specialization,
                experience,
                rating: computedRating,
                reviews: computedReviews,
                price,
                online,
                verified,
                gender: gender as "male" | "female",
                initials,
                hue,
                bio,
                languages,
                whatsapp,
                telegram,
                facebook,
                instagram,
                email,
                password,
                photoUrl,
                points,
              }
            : l
        )
      );
      toast.success("تم الحفظ بنجاح");
      router.push(`/admin/lawyers/${id}`);
      return;
    }

    // If lawyer is from DB, update via API
    if (dbLawyer) {
      try {
        const res = await fetch(`/api/admin/lawyers/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            slug,
            city,
            specialization,
            experience,
            price,
            online,
            verified,
            gender,
            initials,
            hue,
            bio,
            languages,
            whatsapp,
            telegram,
            facebook,
            instagram,
            photoUrl,
            points,
          }),
        });
        if (res.ok) {
          toast.success("تم الحفظ بنجاح");
          router.push(`/admin/lawyers/${id}`);
        } else {
          toast.error("فشل الحفظ", "حدث خطأ أثناء حفظ البيانات");
        }
      } catch {
        toast.error("فشل الحفظ", "تعذر الاتصال بالخادم");
      }
      return;
    }

    toast.error("خطأ", "لا يمكن حفظ البيانات");
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/lawyers/${id}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4" />
            العودة
          </Link>
          <h1 className="text-2xl font-bold">تعديل بيانات المحامي</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={save}>
            <Save className="h-4 w-4" />
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* صورة المحامي */}
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">صورة المحامي</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {photoUrl ? (
                    <img src={photoUrl} alt={name} className="size-20 rounded-full object-cover border-2 border-border" />
                  ) : (
                    <div className={`grid size-20 place-items-center rounded-full text-2xl font-bold text-white bg-gradient-to-br ${hue}`}>
                      {initials || name.slice(0, 2)}
                    </div>
                  )}
                  <label className="absolute -bottom-1 -left-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-md hover:bg-accent/90">
                    <Camera className="size-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) { toast.error("خطأ", "حجم الصورة يجب أن يكون أقل من 2 ميغابايت"); return; }
                        const reader = new FileReader();
                        reader.onload = () => setPhotoUrl(reader.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-medium">صورة الملف الشخصي</p>
                  <p className="text-xs text-muted-foreground">JPG أو PNG — حد أقصى 2 ميغابايت</p>
                  {photoUrl && (
                    <button onClick={() => setPhotoUrl("")} className="mt-1 text-xs text-red-500 hover:text-red-600">إزالة الصورة</button>
                  )}
                </div>
              </div>
            </div>

            {/* الاسم */}
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">الاسم</label>
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Slug */}
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">الرابط الإنجليزي (Slug)</label>
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="مثال: sara-nasser"
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.replace(/\s+/g, "-").toLowerCase())
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                سيظهر في الرابط مثل: /lawyers/{slug || "sara-nasser"}
              </p>
            </div>

            {/* البريد الإلكتروني وكلمة المرور */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">البريد الإلكتروني</label>
                <input
                  type="email"
                  dir="ltr"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">كلمة المرور</label>
                <input
                  type="password"
                  dir="ltr"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* المدينة */}
            <div>
              <label className="mb-1 block text-sm font-medium">المدينة</label>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {data.cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* التخصص */}
            <div>
              <label className="mb-1 block text-sm font-medium">التخصص</label>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              >
                {data.specializations.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* الخبرة */}
            <div>
              <label className="mb-1 block text-sm font-medium">الخبرة (سنة)</label>
              <input
                type="number"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
              />
            </div>

            {/* التقييم */}
            <div>
              <label className="mb-1 block text-sm font-medium">التقييم</label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm">
                <span className="font-bold text-amber-500">{computedRating}</span>
                <span className="text-muted-foreground">/ 5</span>
                <span className="text-xs text-muted-foreground">(من التقييمات الفعلية)</span>
              </div>
            </div>

            {/* عدد المراجعات */}
            <div>
              <label className="mb-1 block text-sm font-medium">عدد المراجعات</label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm">
                <span className="font-bold">{computedReviews}</span>
                <span className="text-xs text-muted-foreground">(تقييم فعلي)</span>
              </div>
            </div>

            {/* السعر */}
            <div>
              <label className="mb-1 block text-sm font-medium">السعر ($)</label>
              <input
                type="number"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>

            {/* النقاط */}
            <div>
              <label className="mb-1 block text-sm font-medium">النقاط</label>
              <input
                type="number"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-muted-foreground">نقاط المكافآت (تُحدّث تلقائياً عند النشر)</p>
            </div>

            {/* الجنس */}
            <div>
              <label className="mb-1 block text-sm font-medium">الجنس</label>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female")}
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>

            {/* الأحرف */}
            <div>
              <label className="mb-1 block text-sm font-medium">الأحرف (2)</label>
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                value={initials}
                maxLength={2}
                onChange={(e) => setInitials(e.target.value)}
              />
            </div>

            {/* اللون */}
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">اللون</label>
              <div className="flex flex-wrap gap-2">
                {hueOptions.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHue(h)}
                    className={`h-8 w-8 rounded-full bg-gradient-to-br ${h} ${hue === h ? "ring-2 ring-accent ring-offset-2" : ""}`}
                  />
                ))}
              </div>
            </div>

            {/* اللغات */}
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">اللغات</label>
              <div className="flex flex-wrap gap-2">
                {["العربية", "الكردية", "الإنجليزية", "الفرنسية"].map(
                  (lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleLang(lang)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        languages.includes(lang)
                          ? "bg-accent text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {lang}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* النبذة */}
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">النبذة</label>
              <textarea
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* الحالة */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={online}
                  onChange={(e) => setOnline(e.target.checked)}
                  className="rounded"
                />
                متصل
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="rounded"
                />
                موثق
              </label>
            </div>

            {/* وسائل التواصل */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                  <MessageCircle className="h-3.5 w-3.5 text-green-500" /> واتساب
                </label>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">تيليجرام</label>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">فيسبوك</label>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">انستجرام</label>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
