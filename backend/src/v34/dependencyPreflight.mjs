import fs from "node:fs";
const root = new URL("../../", import.meta.url);
const pkg = JSON.parse(fs.readFileSync(new URL("package.json", root), "utf8"));
const required = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})];
const missing = required.filter(name => {
  try { import.meta.resolve(name, root); return false; }
  catch { return !fs.existsSync(new URL(`node_modules/${name}/package.json`, root)); }
});
if (missing.length) {
  console.error(`Missing installed dependencies (${missing.length}):`);
  for (const name of missing) console.error(`- ${name}`);
  process.exit(2);
}
console.log(`Dependency preflight PASS (${required.length} packages available).`);
