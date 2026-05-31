import type { ValidationReport, AgentResult } from './types.js';
import { runContentValidator } from './agents/content-validator.js';
import { runBrandConsistency } from './agents/brand-consistency.js';
import { runTechnicalValidator } from './agents/technical-validator.js';
import { runCopySEO } from './agents/copy-seo.js';
import { runUXDesign } from './agents/ux-design.js';

export async function runValidation(htmlPath: string): Promise<ValidationReport> {
  // Run all 5 agents in parallel
  const [content, brand, technical, seo, ux] = await Promise.all([
    Promise.resolve(runContentValidator(htmlPath)),
    Promise.resolve(runBrandConsistency(htmlPath)),
    Promise.resolve(runTechnicalValidator(htmlPath)),
    Promise.resolve(runCopySEO(htmlPath)),
    Promise.resolve(runUXDesign(htmlPath)),
  ]);

  const results: AgentResult[] = [content, brand, technical, seo, ux];

  const summary = results.reduce(
    (acc, r) => ({
      errors: acc.errors + r.errors.length,
      warnings: acc.warnings + r.warnings.length,
      info: acc.info + r.info.length,
    }),
    { errors: 0, warnings: 0, info: 0 }
  );

  return {
    timestamp: new Date().toISOString(),
    builtHtmlPath: htmlPath,
    results,
    summary,
  };
}
