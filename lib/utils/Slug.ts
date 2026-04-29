export function generateSlug(text?: string): string {
  if (!text || typeof text !== "string") {
    return "item";
  }

  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "item";
}