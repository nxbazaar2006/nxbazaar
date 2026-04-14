import NewCategoryForm from "@/components/backoffice/Forms/NewCategoryForm";
import { getCategoryById } from "@/actions/category";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function UpdateCategoryPage({
  params,
}: Props) {
  const { id } = await params;

  const category = await getCategoryById(id);

  if (!category) {
    return notFound();
  }

  return <NewCategoryForm updateData={category} />;
}
