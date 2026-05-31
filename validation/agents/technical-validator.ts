import { readFileSync } from 'fs';
import type { AgentResult, Finding } from '../types.js';

export function runTechnicalValidator(htmlPath: string): AgentResult {
  const html = readFileSync(htmlPath, 'utf-8');
  const errors: Finding[] = [];
  const warnings: Finding[] = [];
  const info: Finding[] = [];

  // Check viewport meta
  if (!html.includes('name="viewport"')) {
    errors.push({
      rule: 'viewport-meta',
      message: 'Missing <meta name="viewport"> tag. Required for mobile rendering.',
      location: 'BaseLayout.astro',
    });
  }

  // Check lang attribute
  if (!html.includes('lang="es"')) {
    warnings.push({
      rule: 'html-lang',
      message: 'HTML <html> element missing lang="es" attribute.',
      location: 'BaseLayout.astro',
    });
  }

  // Check images have alt text
  const imgTags = [...html.matchAll(/<img[^>]*>/gi)];
  const imgsWithoutAlt = imgTags.filter(m => !m[0].includes('alt='));
  if (imgsWithoutAlt.length > 0) {
    warnings.push({
      rule: 'img-alt-text',
      message: `${imgsWithoutAlt.length} image(s) missing alt attribute. Add descriptive alt text for accessibility.`,
      location: 'Image components',
    });
  }

  // Check aria-labels on interactive elements
  const buttonsWithoutAria = [...html.matchAll(/<button[^>]*>/gi)].filter(
    m => !m[0].includes('aria-label') && !m[0].includes('aria-expanded')
  );
  if (buttonsWithoutAria.length > 2) {
    warnings.push({
      rule: 'button-accessibility',
      message: `${buttonsWithoutAria.length} button(s) may lack aria labels. Review interactive elements.`,
      location: 'NavBar / FAQ accordion',
    });
  }

  // Check structured data
  if (!html.includes('application/ld+json')) {
    errors.push({
      rule: 'structured-data',
      message: 'Missing JSON-LD structured data. Add LocalBusiness schema for SEO.',
      location: 'BaseLayout.astro',
    });
  }

  // Check charset
  if (!html.includes('charset="UTF-8"') && !html.includes("charset='UTF-8'")) {
    warnings.push({
      rule: 'charset-meta',
      message: 'Missing or incorrect charset declaration.',
    });
  }

  info.push({
    rule: 'build-output',
    message: 'HTML generated successfully from Astro static build.',
    location: htmlPath,
  });

  return { agent: 'TechnicalValidator', errors, warnings, info };
}
