export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  // TODO: replace avatarUrl with real client photo
  avatarUrl: string | null;
}

// TODO: Replace ALL testimonials with real client quotes and photos before launch
export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Ana L.',
    role: 'Miembro MAISON',
    quote:
      'Por fin un espacio que entiende lo que significa el lujo real. No es el precio, es la atención a cada detalle. Llevo tres meses con la membresía y no volvería a ningún otro lugar.',
    rating: 5,
    // TODO: replace with real photo
    avatarUrl: null,
  },
  {
    id: 'testimonial-2',
    name: 'Sofía R.',
    role: 'Miembro RITUAL',
    quote:
      'La primera vez que entré supe que esto era diferente. El aroma, la forma en que me recibieron por mi nombre... me sentí exactamente como quiero sentirme.',
    rating: 5,
    // TODO: replace with real photo
    avatarUrl: null,
  },
  {
    id: 'testimonial-3',
    name: 'Valentina M.',
    role: 'Miembro SHERRY VIP',
    quote:
      'Sherry no es un lugar al que voy. Es parte de mi semana. El nivel de personalización y la atención de mi especialista son incomparables en Zapopan.',
    rating: 5,
    // TODO: replace with real photo
    avatarUrl: null,
  },
];
