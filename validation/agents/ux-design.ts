import { readFileSync } from 'fs';
import type { AgentResult, Finding } from '../types.js';

export function runUXDesign(htmlPath: string): AgentResult {
  const html = readFileSync(htmlPath, 'utf-8');
  const errors: Finding[] = [];
  const warnings: Finding[] = [];
  const info: Finding[] = [];

  // Check for CTA buttons
  const ctaCount = (html.match(/Reserva/gi) || []).length;
  if (ctaCount < 2) {
    warnings.push({
      rule: 'cta-frequency',
      message: 'Less than 2 "Reserva" CTAs found. Ensure CTAs appear in Hero, FinalCTA, and at least one mid-page section.',
    });
  } else {
    info.push({ rule: 'cta-ok', message: `Found ${ctaCount} reservation CTAs distributed across the page.` });
  }

  // Check hero has CTA
  const heroSection = html.match(/<section[^>]*id="hero"[^>]*>[\s\S]*?<\/section>/i);
  if (heroSection && !heroSection[0].includes('Reserva')) {
    errors.push({
      rule: 'hero-cta',
      message: 'Hero section is missing a reservation CTA.',
      location: 'Hero.astro',
    });
  }

  // Check FAQ accordion exists
  if (!html.includes('faq-item') && !html.includes('faq-trigger')) {
    warnings.push({
      rule: 'faq-accordion',
      message: 'FAQ accordion markup not found. Verify FAQ component renders correctly.',
      location: 'FAQ.astro',
    });
  } else {
    info.push({ rule: 'faq-ok', message: 'FAQ accordion markup present.' });
  }

  // Check membership section
  if (!html.includes('id="membresias"')) {
    warnings.push({
      rule: 'memberships-anchor',
      message: 'Memberships section anchor #membresias not found. Navigation links may be broken.',
      location: 'Memberships.astro',
    });
  }

  // Check WhatsApp link
  if (!html.includes('wa.me')) {
    warnings.push({
      rule: 'whatsapp-link',
      message: 'No WhatsApp (wa.me) link found. Add WhatsApp CTA for high conversion.',
      location: 'FinalCTA.astro',
    });
  }

  // Check mobile viewport
  if (!html.includes('initial-scale=1')) {
    errors.push({
      rule: 'mobile-viewport',
      message: 'Missing initial-scale=1 in viewport meta. Mobile layout may break.',
      location: 'BaseLayout.astro',
    });
  }

  return { agent: 'UXDesign', errors, warnings, info };
}
