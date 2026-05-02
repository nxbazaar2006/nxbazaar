function randomCode(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export function generateUserCode(length?: number): string;
export function generateUserCode(
  prefix: string,
  title: string,
  length?: number
): string;
export function generateUserCode(
  prefixOrLength: string | number = 6,
  title = "",
  length = 6
): string {
  if (typeof prefixOrLength === "number") {
    return randomCode(prefixOrLength);
  }

  const titleCode = title
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 4);

  return [prefixOrLength.toUpperCase(), titleCode, randomCode(length)]
    .filter(Boolean)
    .join("-");
}
