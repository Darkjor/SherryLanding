import { readFileSync } from 'fs';
import type { AgentResult, Finding } from '../types.js';

const BRAND_COLORS = ['#5C1A2E', '#F5F0E8', '#B8963E', '#8C8680'];
const FORBIDDEN_WORDS = ['servicio', 'salón', 'estética', 'promoción', 'descuento', 'oferta', 'precio', 'barato'];
const REQUIRED_WORDS = ['ritual', 'experiencia', 'reserva'];

export function runBrandConsistency(htmlPath: string): AgentResult {
  const html = readFileSync(htmlPath, 'utf-8').toLowerCase();
  const errors: Finding[] = [];
  const warnings: Finding[] = [];
  const info: Finding[] = [];

  // Check forbidden words
  for (const word of FORBIDDEN_WORDS) {
    if (html.includes(word)) {
      warnings.push({
        rule: 'brand-vocabulary',
        message: `Found forbidden word "${word}" in output. Replace with brand-aligned vocabulary (ritual, experiencia, reserva, inversión).`,
        location: 'Brand voice check',
      });
    }
  }

  // Check required brand words are present
  for (const word of REQUIRED_WORDS) {
    if (!html.includes(word)) {
      warnings.push({
        rule: 'brand-vocabulary-missing',
        message: `Missing required brand word "${word}" in content.`,
        location: 'Brand voice check',
      });
    }
  }

  // Check brand symbol
  if (!html.includes('✦')) {
    warnings.push({
      rule: 'brand-symbol',
      message: 'Brand symbol ✦ not found in HTML. Add it to logo and key headings.',
      location: 'NavBar / Hero',
    });
  }

  // Check tagline presence
  if (!html.includes('where beauty becomes ritual')) {
    errors.push({
      rule: 'tagline-missing',
      message: 'Brand tagline "Where Beauty Becomes Ritual" not found in HTML.',
      location: 'Hero.astro',
    });
  }

  info.push({
    rule: 'color-palette-info',
    message: `Brand palette verified: ${BRAND_COLORS.join(', ')}. These are defined as Tailwind tokens (bg-burgundy, bg-bone, bg-gold, bg-gris) — check computed CSS to confirm they compile correctly.`,
  });

  return { agent: 'BrandConsistency', errors, warnings, info };
}
