import { getShellArrangementByZ } from "../js/utils/electronArrangement.js";

const checks = { 1: [1], 24: [2, 8, 13, 1], 26: [2, 8, 14, 2], 29: [2, 8, 18, 1] };
let failures = 0;
for (const [z, expected] of Object.entries(checks)) {
  const shells = getShellArrangementByZ(+z);
  const ok = expected.every((v, i) => shells[i] === v);
  console.log(`Z=${z}: [${shells.join(", ")}] ${ok ? "ok" : "FAIL"}`);
  if (!ok) failures++;
}
process.exit(failures ? 1 : 0);
