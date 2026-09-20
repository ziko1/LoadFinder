from pathlib import Path
import re, zipfile

root = Path(__file__).resolve().parents[1]
android = root / "android"
main = android / "app/app/src/main/java"
assert (android / "settings.gradle.kts").exists()
assert (android / "build.gradle.kts").exists()
assert (android / "app/app/build.gradle.kts").exists()
assert (root / "backend").exists()

kotlin = list(main.rglob("*.kt"))
assert kotlin
assert all("TODO()" not in p.read_text() for p in kotlin)

def balanced(s):
    d = 0
    for c in s:
        if c == "{": d += 1
        elif c == "}": d -= 1
        if d < 0: return False
    return d == 0

assert all(balanced(p.read_text()) for p in kotlin)

g = (android / "app/app/build.gradle.kts").read_text()
r = (android / "build.gradle.kts").read_text()
assert "8.7.3" in r
assert "ksp(" in g
assert "paging-runtime:3.5.1" in g
assert "play-services-location:21.3.0" in g
assert "hilt-compiler:2.53.1" in g

# Duplicate top-level declarations in the application source set.
decls = {}
for p in main.rglob("*.kt"):
    t = p.read_text()
    m = re.search(r"^\s*package\s+([^\s]+)", t, re.M)
    pkg = m.group(1) if m else ""
    for d in re.finditer(r"\b(class|object|interface)\s+([A-Za-z_]\w*)", t):
        decls.setdefault((pkg, d.group(2)), []).append(p)
assert not any(len(v) > 1 for v in decls.values())

print("LoadFinder source preflight: PASS")
print(f"Kotlin files: {len(kotlin)}")
print("TODO() = 0")
print("Gradle/dependency contracts: PASS")
print("Duplicate declarations: 0")
