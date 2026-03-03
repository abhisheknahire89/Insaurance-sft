import * as fs from 'fs';
import * as path from 'path';

const BASE = path.resolve(__dirname, '..');
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(BASE, p), 'utf-8'));

const icdDict: Record<string, string> = read('data/icd10cm_2024_codes.json');
const seeds: any[] = read('data/condition_seed_list.json');

console.log('\n🔍  ICD-10-CM 2024 Code Validation Report');
console.log('='.repeat(50));

let passed = 0, failed = 0;
seeds.forEach(seed => {
    const code = seed.primary_code;
    if (icdDict[code]) {
        passed++;
    } else {
        failed++;
        console.warn(`  ❌ ${seed.id.padEnd(12)} | ${code.padEnd(14)} | NOT IN DICTIONARY`);
    }
});

console.log(`\n  ✅ Valid codes  : ${passed}`);
console.log(`  ❌ Invalid codes: ${failed}`);
console.log(`  📋 Total seeds  : ${seeds.length}`);

// Check dict integrity
const dictCodes = Object.keys(icdDict);
console.log(`\n  📚 Dictionary size: ${dictCodes.length} codes`);

if (failed === 0) {
    console.log('\n✅  All primary codes validated successfully against ICD-10-CM 2024!\n');
} else {
    console.log('\n⚠️   Fix invalid codes before running the build.\n');
    process.exit(1);
}
