from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
wrapper=root/"gradlew"
system_gradle=shutil.which("gradle")
print("V69 GRADLE PREFLIGHT")
print("wrapper=", "PRESENT" if wrapper.exists() else "MISSING")
print("system_gradle=", system_gradle or "MISSING")
if not wrapper.exists() and not system_gradle:
    print("STATUS=BOOTSTRAP_REQUIRED")
else:
    print("STATUS=BUILD_ENTRYPOINT_AVAILABLE")
