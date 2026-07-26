"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../../admin-context";
import { ArrowRight, Pencil, MapPin, Phone, Mail, Users, Building2 } from "lucide-react";

export default function LawFirmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useAdminContext();
  const firm = data.lawFirms.find((f) => f.id === id);

  if (!firm) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-lg text-muted-foreground">لم يتم العثور على المكتب</p>
        <Link href="/admin/law-firms">
          <Button variant="outline">
            <ArrowRight className="h-4 w-4" />
            العودة إلى المكاتب
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/law-firms" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-4 w-4" />
          العودة إلى المكاتب
        </Link>
        <Button size="sm" disabled>
          <Pencil className="h-4 w-4" />
          تعديل
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-lg font-bold text-white shadow-lg">
              {firm.name.slice(0, 2)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{firm.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{firm.city}</span>
                {firm.address && <span className="text-muted-foreground">— {firm.address}</span>}
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <Users className="mx-auto mb-1 h-4 w-4 text-accent" />
              <p className="text-lg font-bold">{firm.lawyers.length}</p>
              <p className="text-xs text-muted-foreground">محامون</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <Building2 className="mx-auto mb-1 h-4 w-4 text-blue-500" />
              <p className="text-lg font-bold">{firm.phones.length}</p>
              <p className="text-xs text-muted-foreground">أرقام هاتف</p>
            </div>
          </div>

          {firm.phones.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">أرقام الهاتف</h3>
              <div className="space-y-1">
                {firm.phones.map((phone, i) => (
                  <p key={i} className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-green-500" />
                    {phone}
                  </p>
                ))}
              </div>
            </div>
          )}

          {firm.email && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">البريد الإلكتروني</h3>
              <p className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                {firm.email}
              </p>
            </div>
          )}

          {!firm.phones.length && !firm.email && (
            <p className="text-sm text-muted-foreground">لا توجد معلومات تواصل</p>
          )}

          {firm.lawyers.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">المحامون في المكتب</h3>
              <div className="space-y-2">
                {firm.lawyers.map((lawyer, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${lawyer.hue} text-xs font-bold text-white`}>
                      {lawyer.name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{lawyer.name}</p>
                      <p className="text-xs text-muted-foreground">{lawyer.specialization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
