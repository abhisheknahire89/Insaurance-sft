const fs = require('fs');
const content = fs.readFileSync('file', 'utf8');
const match = content.match(/\*\*FILE:\s*(?:Update in\s*)?`src\/data\/icd10Tier1Enriched\.ts`\*\*\s*```(?:typescript|ts)?\n([\s\S]+?)\n```/);
if (match) {
    fs.writeFileSync('src/data/icd10Tier1Enriched.ts', match[1]);
    console.log("Success: icd10Tier1Enriched.ts");
} else {
    console.log("Failed to match icd10Tier1Enriched.ts");
}
