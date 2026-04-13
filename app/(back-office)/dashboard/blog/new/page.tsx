import FormHeader from "@/components/backoffice/FormHeader";
import BlogForm from "@/components/backoffice/BlogForm";

export default function Page() {
  return (
    <div>
      <FormHeader title="New Blog" />
      <BlogForm />
    </div>
  );
}