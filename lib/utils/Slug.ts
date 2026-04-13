export function generateSlug(text: string): string {
  return text
    .normalize("NFKD") // unicode normalize
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}