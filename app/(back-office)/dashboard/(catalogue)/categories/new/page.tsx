import NewCategoryForm from "@/components/backoffice/Forms/NewCategoryForm";
import FormHeader from "@/components/backoffice/FormHeader";

export default async function NewCategoryPage() {
  return (
    <div className="space-y-4">
      <FormHeader title="New Category" />
      <NewCategoryForm />
    </div>
  );
}
