export interface MembershipBenefit {
  text: string;
  highlighted?: boolean;
}

export interface Membership {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  period: string;
  tagline: string;
  benefits: MembershipBenefit[];
  savings: string;
  recommended: boolean;
  ctaText: string;
}

export const memberships: Membership[] = [
  {
    id: 'ritual',
    name: 'RITUAL',
    price: 999,
    priceDisplay: '$999',
    period: 'al mes',
    tagline: 'Tu primer ritual mensual.',
    benefits: [
      { text: '1 manicure gelish al mes' },
      { text: '10% de descuento en retail' },
      { text: 'Acceso a agenda preferencial' },
    ],
    savings: 'Ahorro aproximado $150/mes',
    recommended: false,
    ctaText: 'Elegir Ritual',
  },
  {
    id: 'maison',
    name: 'MAISON',
    price: 1799,
    priceDisplay: '$1,799',
    period: 'al mes',
    tagline: 'La experiencia completa.',
    benefits: [
      { text: '2 manicures al mes', highlighted: true },
      { text: '1 pedicure express mensual', highlighted: true },
      { text: '15% de descuento en retail' },
      { text: 'Prioridad en agenda', highlighted: true },
      { text: 'Beverage de bienvenida incluido' },
    ],
    savings: 'Ahorro aproximado $400/mes + prioridad',
    recommended: true,
    ctaText: 'Elegir Maison',
  },
  {
    id: 'vip',
    name: 'SHERRY VIP',
    price: 3200,
    priceDisplay: '$3,200',
    period: 'al mes',
    tagline: 'Acceso total. Sin límites.',
    benefits: [
      { text: 'Servicios ilimitados' },
      { text: 'Cabina privada con prioridad' },
      { text: 'Evento exclusivo trimestral' },
      { text: 'Especialista dedicada' },
      { text: 'Acceso completo y personalización total' },
    ],
    savings: 'Experiencia sin restricciones',
    recommended: false,
    ctaText: 'Elegir VIP',
  },
];
