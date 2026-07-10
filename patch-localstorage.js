const fs = require("fs");
const path = require("path");

function patchFile(filename) {
  const filepath = path.join("src/app-pages", filename);
  let content = fs.readFileSync(filepath, "utf8");
  
  // Pattern 1: Module-level functions that access localStorage
  // Add typeof window guard to functions that call localStorage
  content = content.replace(
    /function\s+(load\w*|save\w*|get\w*)\s*\([^)]*\)\s*\{/g,
    (match) => {
      // Only add guard if function contains localStorage
      const funcStart = content.indexOf(match);
      const nextFunc = content.indexOf("function ", funcStart + match.length);
      const funcEnd = nextFunc > 0 ? nextFunc : content.length;
      const funcBody = content.slice(funcStart, funcEnd);
      if (funcBody.includes("localStorage")) {
        return match + "\n  if (typeof window === 'undefined') return;";
      }
      return match;
    }
  );
  
  // Pattern 2: Standalone localStorage.getItem at module level (not inside function)
  // These need to be wrapped or guarded
  
  fs.writeFileSync(filepath, content);
  console.log("Patched: " + filename);
}

// List of files that need patching
const files = [
  "Yearly.tsx", "Travel.tsx", "RocketRealm.tsx", "SpecialDates.tsx",
  "Abundance.tsx", "HomeSanctuary.tsx", "HuskyOptimization.tsx",
  "Cover.tsx", "Notes.tsx", "Nourishment.tsx", "ContentCreation.tsx",
  "LifeIntegration.tsx", "MedicineRitual.tsx", "MoneyMaking.tsx",
  "MoonCycle.tsx", "RocketBusiness.tsx", "SacredRoutines.tsx"
];

for (const f of files) {
  if (fs.existsSync(path.join("src/app-pages", f))) {
    patchFile(f);
  }
}

console.log("Done patching.");
