import FormHeader from "@/components/backoffice/FormHeader";
import VlogForm from "@/components/backoffice/VlogForm";

export default function Page() {
  return (
    <div>
      <FormHeader title="New Vlog" />
      <VlogForm />
    </div>
  );
}