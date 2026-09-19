import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mustExist = [
  "backend/package.json",
  "backend/tsconfig.json",
  "backend/src/server.ts",
  "backend/src/v15/routes.ts",
  "backend/src/v16/worker.ts",
  "backend/src/v17/worker.ts",
  "backend/sql/v18_production.sql",
  "android/settings.gradle.kts",
  "android/build.gradle.kts",
  "android/app/app/build.gradle.kts",
  "android/app/app/src/main/AndroidManifest.xml",
];
const missing = mustExist.filter(x => !fs.existsSync(path.join(root,x)));
if (missing.length) throw new Error(`Missing: ${missing.join(", ")}`);
const settings = fs.readFileSync(path.join(root,"android/settings.gradle.kts"),"utf8");
if (!settings.includes('project(":app").projectDir = file("app/app")')) throw new Error("Canonical Android module is not wired");
const rootBuild = fs.readFileSync(path.join(root,"android/build.gradle.kts"),"utf8");
for (const plugin of ['com.google.dagger.hilt.android','com.google.devtools.ksp']) if (!rootBuild.includes(plugin)) throw new Error(`Missing root plugin: ${plugin}`);
const server = fs.readFileSync(path.join(root,"backend/src/server.ts"),"utf8");
if (!server.includes('version: "v21"')) throw new Error("Server health version stale");
console.log("V21 structural regression audit: PASS");
