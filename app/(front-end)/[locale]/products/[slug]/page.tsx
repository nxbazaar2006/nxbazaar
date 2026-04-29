import db from "@/lib/db";
import { localeToLanguage } from "@/lib/i18n/languageMapper";

export default async function Page({ params }: any) {
  const language = localeToLanguage(params.locale);

  const data = await db.productTranslation.findFirst({
    where: {
      slug: params.slug,
      language,
    },
  });

  return <div>{data?.title}</div>;
}