export function pluralize(type: string): string {
  if (!type) return type;
  return type + "s";
  if (type.endsWith("y")) {
    return type.slice(0, -1) + "ies"; // category → categories
  }
  if (type.endsWith("ch") || type.endsWith("sh")) {
    return type + "es"; // match → matches
  }
  return type + "s"; // default
}
