import { readFileSync } from 'fs';
import type { AgentResult, Finding } from '../types.js';

export function runCopySEO(htmlPath: string): AgentResult {
  const html = readFileSync(htmlPath, 'utf-8');
  const errors: Finding[] = [];
  const warnings: Finding[] = [];
  const info: Finding[] = [];

  // Title tag
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) {
    errors.push({ rule: 'title-tag', message: 'Missing <title> tag.', location: 'BaseLayout.astro' });
  } else {
    const title = titleMatch[1];
    if (title.length < 30 || title.length > 70) {
      warnings.push({
        rule: 'title-length',
        message: `Title length is ${title.length} chars. Ideal: 30–70. Current: "${title}"`,
      });
    } else {
      info.push({ rule: 'title-ok', message: `Title OK (${title.length} chars): "${title}"` });
    }
  }

  // Meta description
  const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
  if (!descMatch) {
    errors.push({ rule: 'meta-description', message: 'Missing <meta name="description"> tag.' });
  } else {
    const desc = descMatch[1];
    if (desc.length < 120 || desc.length > 160) {
      warnings.push({
        rule: 'meta-description-length',
        message: `Meta description length is ${desc.length} chars. Ideal: 120–160.`,
      });
    } else {
      info.push({ rule: 'meta-description-ok', message: `Meta description OK (${desc.length} chars).` });
    }
  }

  // H1 check
  const h1Matches = [...html.matchAll(/<h1[^>]*>/gi)];
  if (h1Matches.length === 0) {
    errors.push({ rule: 'h1-missing', message: 'No <h1> found on page.', location: 'Hero.astro' });
  } else if (h1Matches.length > 1) {
    warnings.push({ rule: 'multiple-h1', message: `Found ${h1Matches.length} <h1> tags. Page should have exactly one.` });
  } else {
    info.push({ rule: 'h1-ok', message: 'Single <h1> tag present.' });
  }

  // OG tags
  if (!html.includes('property="og:title"') && !html.includes("property='og:title'")) {
    warnings.push({ rule: 'og-title', message: 'Missing og:title meta tag.', location: 'BaseLayout.astro' });
  }
  if (!html.includes('property="og:image"') && !html.includes("property='og:image'")) {
    warnings.push({ rule: 'og-image', message: 'Missing og:image. Add real hero photo for social sharing.', location: 'BaseLayout.astro' });
  }

  // Keyword check
  const lowerHtml = html.toLowerCase();
  const keywords = ['zapopan', 'jalisco', 'uñas', 'belleza', 'manicure'];
  for (const kw of keywords) {
    if (!lowerHtml.includes(kw)) {
      info.push({ rule: 'keyword-check', message: `Keyword "${kw}" not found in HTML. Consider adding for local SEO.` });
    }
  }

  return { agent: 'CopySEO', errors, warnings, info };
}
