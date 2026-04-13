export function generateSEO(title: string, description?: string) {
  return {
    metaTitle: title.slice(0, 60),
    metaDescription: description?.slice(0, 160) || "",
  };
}