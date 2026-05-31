import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { runValidation } from './orchestrator.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');
const htmlPath = join(projectRoot, 'dist', 'index.html');

if (!existsSync(htmlPath)) {
  console.error('\n❌  dist/index.html not found. Run `npm run build` first.\n');
  process.exit(1);
}

console.log('\n🔍  Sherry Landing — Multi-Agent Validation\n');
console.log(`   HTML: ${htmlPath}\n`);
console.log('   Running 5 agents in parallel...\n');

const report = await runValidation(htmlPath);

// Print results by agent
for (const result of report.results) {
  console.log(`\n━━━ ${result.agent} ━━━`);

  for (const e of result.errors) {
    console.log(`  ❌  ERROR  [${e.rule}]`);
    console.log(`     ${e.message}`);
    if (e.location) console.log(`     Location: ${e.location}`);
  }
  for (const w of result.warnings) {
    console.log(`  ⚠️   WARN   [${w.rule}]`);
    console.log(`     ${w.message}`);
    if (w.location) console.log(`     Location: ${w.location}`);
  }
  for (const i of result.info) {
    console.log(`  ℹ️   INFO   [${i.rule}]`);
    console.log(`     ${i.message}`);
  }
}

// Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  VALIDATION SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  ❌  Errors:   ${report.summary.errors}`);
console.log(`  ⚠️   Warnings: ${report.summary.warnings}`);
console.log(`  ℹ️   Info:     ${report.summary.info}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (report.summary.errors > 0) {
  console.log('  🚫  Not ready for launch. Fix all errors first.\n');
  process.exit(1);
} else if (report.summary.warnings > 0) {
  console.log('  ⚠️   Review warnings before launch.\n');
} else {
  console.log('  ✅  Validation passed. Ready for launch.\n');
}
