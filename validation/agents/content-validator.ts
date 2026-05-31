import { readFileSync } from 'fs';
import type { AgentResult, Finding } from '../types.js';

export function runContentValidator(htmlPath: string): AgentResult {
  const html = readFileSync(htmlPath, 'utf-8');
  const errors: Finding[] = [];
  const warnings: Finding[] = [];
  const info: Finding[] = [];

  // Check for explicit TODO markers
  const todoMatches = [...html.matchAll(/TODO/gi)];
  if (todoMatches.length > 0) {
    errors.push({
      rule: 'no-todo-markers',
      message: `Found ${todoMatches.length} TODO marker(s) in production HTML. Replace all placeholder content before launch.`,
      location: 'dist/index.html',
    });
  }

  // Check for placeholder phone number
  if (html.includes('XXXXXXXXXX')) {
    errors.push({
      rule: 'real-phone-required',
      message: 'WhatsApp number is still a placeholder (XXXXXXXXXX). Add real phone number.',
      location: 'FinalCTA.astro / Footer.astro',
    });
  }

  // Check for placeholder email
  if (html.includes('[email@sherry.mx]')) {
    errors.push({
      rule: 'real-email-required',
      message: 'Contact email is still a placeholder. Add real email address.',
      location: 'FinalCTA.astro',
    });
  }

  // Check for placeholder address
  if (html.includes('[Dirección en Zapopan')) {
    errors.push({
      rule: 'real-address-required',
      message: 'Physical address is still a placeholder. Add real Zapopan address.',
      location: 'FinalCTA.astro',
    });
  }

  // Check for placeholder Instagram
  if (html.includes('sherrymexico — TODO') || html.includes('@sherrymexico — TODO')) {
    warnings.push({
      rule: 'real-instagram-required',
      message: 'Instagram handle is still a placeholder. Confirm real handle.',
      location: 'Footer.astro',
    });
  }

  // Check testimonials are placeholder
  if (html.includes('Ana L.') || html.includes('Sofía R.') || html.includes('Valentina M.')) {
    warnings.push({
      rule: 'real-testimonials-required',
      message: 'Testimonials contain placeholder names (Ana L., Sofía R., Valentina M.). Replace with real client testimonials before launch.',
      location: 'Testimonials.astro',
    });
  }

  // Check for hero image
  if (!html.includes('hero') || html.includes('placeholder')) {
    info.push({
      rule: 'hero-image-check',
      message: 'Verify hero imagery uses real photography of the Sherry space, not stock or placeholder images.',
      location: 'Hero.astro',
    });
  }

  return { agent: 'ContentValidator', errors, warnings, info };
}
