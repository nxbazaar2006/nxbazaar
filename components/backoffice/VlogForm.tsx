"use client";
import { useState } from "react";
import { VlogInput } from "@/lib/validators/vlog.schema";
import { useCreateVlog, useUpdateVlog } from "@/hooks/useVlog";
import { useRouter } from "next/navigation";

type VlogLocale = VlogInput["translations"][number]["locale"];
type VlogTranslationInput = VlogInput["translations"][number];
const locales: VlogLocale[] = ["EN", "HI", "MR"];

export default function VlogForm({ initialData, vlogId }: { initialData?: VlogInput; vlogId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(vlogId);
  const [active, setActive] = useState<VlogLocale>("EN");
  const [form, setForm] = useState<VlogInput>(
    initialData ?? { title: "", productId: "", userId: "", blogId: "", translations: locales.map((l) => ({ locale: l, title: "", slug: "" })) }
  );
  const create = useCreateVlog();
  const update = useUpdateVlog();

  const updateTrans = (locale: VlogLocale, field: "title" | "slug", value: string) => {
    setForm((prev: VlogInput) => ({
      ...prev,
      translations: prev.translations.map((t: VlogTranslationInput) =>
        t.locale === locale ? { ...t, [field]: value } : t
      ),
    }));
  };

  const submit = async () => {
    if (isEdit && vlogId) await update.mutateAsync({ id: vlogId, data: form });
    else await create.mutateAsync(form);
    router.push("/dashboard/vlog");
    router.refresh();
  };

  const current = form.translations.find(
    (t: VlogTranslationInput) => t.locale === active
  );
  return <div className="space-y-3">
    <input className="border p-2 w-full" placeholder="Vlog title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
    <input className="border p-2 w-full" placeholder="Product ID" value={form.productId ?? ""} onChange={(e)=>setForm({...form,productId:e.target.value})} />
    <input className="border p-2 w-full" placeholder="Blog ID" value={form.blogId ?? ""} onChange={(e)=>setForm({...form,blogId:e.target.value})} />
    <input className="border p-2 w-full" placeholder="User ID" value={form.userId ?? ""} onChange={(e)=>setForm({...form,userId:e.target.value})} />
    <div className="flex gap-2">{locales.map((l)=><button type="button" key={l} onClick={()=>setActive(l)} className="border px-2 py-1">{l}</button>)}</div>
    <input className="border p-2 w-full" placeholder={`Translation title (${active})`} value={current?.title ?? ""} onChange={(e)=>updateTrans(active,"title",e.target.value)} />
    <input className="border p-2 w-full" placeholder={`Translation slug (${active})`} value={current?.slug ?? ""} onChange={(e)=>updateTrans(active,"slug",e.target.value)} />
    <button type="button" onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded-2xl">{isEdit ? "Update Vlog" : "Create Vlog"}</button>
  </div>;
}
