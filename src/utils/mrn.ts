export function generateMRN(counter: number) {
  return `MR-${counter.toString().padStart(6, "0")}`;
}
