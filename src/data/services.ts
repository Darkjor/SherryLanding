export interface Service {
  id: string;
  name: string;
  description: string;
  priceRange: string;
  frequency: string;
  category: 'nails' | 'feet' | 'hair' | 'experience' | 'retail' | 'events';
}

export const services: Service[] = [
  {
    id: 'gelish',
    name: 'Gelish / Color en Gel',
    description: 'Acabado impecable de larga duración con técnica profesional y protocolo de preparación Sherry.',
    priceRange: '$650 – $850',
    frequency: 'Cada 3–4 semanas',
    category: 'nails',
  },
  {
    id: 'sculptural',
    name: 'Uñas Esculturales',
    description: 'Extensiones y diseños esculturales con materiales premium. Arte en cada detalle.',
    priceRange: '$950 – $1,400',
    frequency: 'Cada 4–6 semanas',
    category: 'nails',
  },
  {
    id: 'korean',
    name: 'Manicure Coreana',
    description: 'Protocolo de cuidado profundo inspirado en la técnica coreana. Manos perfectas.',
    priceRange: '$750 – $1,100',
    frequency: 'Cada 3–4 semanas',
    category: 'nails',
  },
  {
    id: 'pedicure',
    name: 'Pedicure con Ritual',
    description: 'Pedicure premium con protocolo completo de ritual Sherry: remojo, exfoliación y acabado perfecto.',
    priceRange: '$550 – $900',
    frequency: 'Cada 3–4 semanas',
    category: 'feet',
  },
  {
    id: 'hair',
    name: 'Tratamientos y Peinados',
    description: 'Tratamientos capilares y peinados para eventos especiales con especialistas certificadas.',
    priceRange: '$800 – $2,500',
    frequency: 'Según necesidad',
    category: 'hair',
  },
  {
    id: 'private',
    name: 'Sherry At Home',
    description: 'Experiencia privada en tu espacio. El ritual Sherry llega a donde tú estás.',
    priceRange: '$2,500 – $5,000',
    frequency: 'Evento especial',
    category: 'experience',
  },
];
