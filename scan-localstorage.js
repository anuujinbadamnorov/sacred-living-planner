const fs = require("fs");
const path = require("path");

const files = fs.readdirSync("src/app-pages").filter(f => f.endsWith(".tsx") && !f.endsWith(".bak"));

for (const file of files) {
  const content = fs.readFileSync(path.join("src/app-pages", file), "utf8");
  const lines = content.split("\n");
  
  const issues = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("localStorage") && !line.includes("typeof window") && !line.includes("//")) {
      // Check if it's inside useEffect or an event handler (simple heuristic)
      const context = lines.slice(Math.max(0, i-5), i+1).join(" ");
      const isSafe = /useEffect|useCallback|onClick|onChange|onSubmit|handle\w+/.test(context) && 
                     !/useState.*\(\s*\(/.test(context);
      if (!isSafe) {
        issues.push({line: i+1, text: line.trim().slice(0, 100)});
      }
    }
  }
  
  if (issues.length > 0) {
    console.log("\n=== " + file + " ===");
    for (const issue of issues) {
      console.log("  Line " + issue.line + ": " + issue.text);
    }
  }
}
