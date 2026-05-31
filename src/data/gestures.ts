export interface Gesture {
  number: string;
  name: string;
  description: string;
}

export const gestures: Gesture[] = [
  {
    number: '01',
    name: 'Saludo por nombre',
    description: '"Buenas tardes, [Nombre]. Bienvenida a Sherry." Cada clienta es recibida de forma personal, nunca genérica.',
  },
  {
    number: '02',
    name: 'Guardarropa discreto',
    description: 'Tu abrigo y bolso son resguardados con cuidado. Cada pertenencia, tratada con la misma atención que tu visita.',
  },
  {
    number: '03',
    name: 'El aroma',
    description: 'La fragancia exclusiva Sherry perfuma cada espacio. Un aroma que se convierte en memoria sensorial.',
  },
  {
    number: '04',
    name: 'Beverage de bienvenida',
    description: 'Té, agua mineral o la bebida especial de la casa. Un gesto que transforma la espera en ritual.',
  },
  {
    number: '05',
    name: 'Transición personal',
    description: 'Tu especialista te acompaña personalmente a tu estación. Nada se deja al azar.',
  },
];
