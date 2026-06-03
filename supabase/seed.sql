-- ============================================================================
-- Sherry Studio — seed.sql
-- Datos iniciales de CONTENIDO traducidos desde src/data/*.ts (texto exacto).
-- + staff de ejemplo, membership_plans y el registro único de site_settings.
-- Ejecutar DESPUÉS de 0001_schema.sql y 0002_rls.sql.
-- Las comillas simples se escapan duplicándolas ('').
-- ============================================================================

-- ----------------------------------------------------------------------------
-- services  (duration_min inferido; sort_order por orden del array)
-- ----------------------------------------------------------------------------
insert into services (id, name, description, price_range, duration_min, frequency, category, sort_order) values
  ('gelish', 'Gelish / Color en Gel', 'Acabado impecable de larga duración con técnica profesional y protocolo de preparación Sherry.', '$650 – $850', 60, 'Cada 3–4 semanas', 'nails', 0),
  ('sculptural', 'Uñas Esculturales', 'Extensiones y diseños esculturales con materiales premium. Arte en cada detalle.', '$950 – $1,400', 120, 'Cada 4–6 semanas', 'nails', 1),
  ('korean', 'Manicure Coreana', 'Protocolo de cuidado profundo inspirado en la técnica coreana. Manos perfectas.', '$750 – $1,100', 75, 'Cada 3–4 semanas', 'nails', 2),
  ('pedicure', 'Pedicure con Ritual', 'Pedicure premium con protocolo completo de ritual Sherry: remojo, exfoliación y acabado perfecto.', '$550 – $900', 60, 'Cada 3–4 semanas', 'feet', 3),
  ('hair', 'Tratamientos y Peinados', 'Tratamientos capilares y peinados para eventos especiales con especialistas certificadas.', '$800 – $2,500', 90, 'Según necesidad', 'hair', 4),
  ('private', 'Sherry At Home', 'Experiencia privada en tu espacio. El ritual Sherry llega a donde tú estás.', '$2,500 – $5,000', 180, 'Evento especial', 'experience', 5);

-- ----------------------------------------------------------------------------
-- memberships  (benefits como jsonb)
-- ----------------------------------------------------------------------------
insert into memberships (id, name, price, price_display, period, tagline, benefits, savings, recommended, cta_text, sort_order) values
  ('ritual', 'RITUAL', 999, '$999', 'al mes', 'Tu primer ritual mensual.',
   '[{"text":"1 manicure gelish al mes"},{"text":"10% de descuento en retail"},{"text":"Acceso a agenda preferencial"}]'::jsonb,
   'Ahorro aproximado $150/mes', false, 'Elegir Ritual', 0),
  ('maison', 'MAISON', 1799, '$1,799', 'al mes', 'La experiencia completa.',
   '[{"text":"2 manicures al mes","highlighted":true},{"text":"1 pedicure express mensual","highlighted":true},{"text":"15% de descuento en retail"},{"text":"Prioridad en agenda","highlighted":true},{"text":"Beverage de bienvenida incluido"}]'::jsonb,
   'Ahorro aproximado $400/mes + prioridad', true, 'Elegir Maison', 1),
  ('vip', 'SHERRY VIP', 3200, '$3,200', 'al mes', 'Acceso total. Sin límites.',
   '[{"text":"Servicios ilimitados"},{"text":"Cabina privada con prioridad"},{"text":"Evento exclusivo trimestral"},{"text":"Especialista dedicada"},{"text":"Acceso completo y personalización total"}]'::jsonb,
   'Experiencia sin restricciones', false, 'Elegir VIP', 2);

-- ----------------------------------------------------------------------------
-- testimonials
-- ----------------------------------------------------------------------------
insert into testimonials (id, name, role, quote, rating, avatar_url, sort_order) values
  ('testimonial-1', 'Ana L.', 'Miembro MAISON', 'Por fin un espacio que entiende lo que significa el lujo real. No es el precio, es la atención a cada detalle. Llevo tres meses con la membresía y no volvería a ningún otro lugar.', 5, null, 0),
  ('testimonial-2', 'Sofía R.', 'Miembro RITUAL', 'La primera vez que entré supe que esto era diferente. El aroma, la forma en que me recibieron por mi nombre... me sentí exactamente como quiero sentirme.', 5, null, 1),
  ('testimonial-3', 'Valentina M.', 'Miembro SHERRY VIP', 'Sherry no es un lugar al que voy. Es parte de mi semana. El nivel de personalización y la atención de mi especialista son incomparables en Zapopan.', 5, null, 2);

-- ----------------------------------------------------------------------------
-- faq  (ids generados faq-1..faq-12)
-- ----------------------------------------------------------------------------
insert into faq (id, question, answer, sort_order) values
  ('faq-1', '¿Qué hace diferente a Sherry de otros lugares?', 'Sherry no es un salón ni una estética. Es una Luxury Beauty House diseñada para quienes valoran la experiencia completa: desde el aroma al entrar hasta el detalle de cada gesto. Cada visita es un ritual, no una transacción.', 0),
  ('faq-2', '¿Cómo funciona el modelo de membresía?', 'Las membresías te dan acceso a servicios mensuales con tarifa preferencial, descuentos en retail y prioridad en agenda. Puedes elegir entre tres niveles según tu frecuencia de visita. No hay contratos forzosos — tu permanencia es por gusto, no por obligación.', 1),
  ('faq-3', '¿Puedo cancelar mi membresía en cualquier momento?', 'Sí. Puedes cancelar con 15 días de anticipación antes de tu siguiente ciclo. Valoramos que estés aquí porque quieres estarlo.', 2),
  ('faq-4', '¿Qué incluye el "ritual de bienvenida"?', 'Al llegar a Sherry recibirás: saludo por nombre, resguardo de tus pertenencias, aromatización del espacio, beverage de bienvenida (té, agua mineral o bebida de la casa) y acompañamiento personal a tu estación.', 3),
  ('faq-5', '¿Con cuánta anticipación debo reservar?', 'Recomendamos reservar con al menos 48 horas de anticipación para asegurar tu especialista preferida. Las clientas con membresía MAISON y VIP tienen prioridad de agenda.', 4),
  ('faq-6', '¿Qué pasa si necesito cancelar mi reserva?', 'Puedes cancelar o reprogramar hasta 24 horas antes sin cargo. Cancelaciones con menos de 24 horas pueden generar un cargo por el valor del servicio reservado.', 5),
  ('faq-7', '¿Atienden a hombres?', 'Sherry es una experiencia diseñada específicamente para mujeres. Nuestro espacio, protocolo y atención están pensados para ellas.', 6),
  ('faq-8', '¿Tienen servicio a domicilio?', 'Sí. "Sherry At Home" lleva el ritual completo a tu espacio para ocasiones especiales. Consulta disponibilidad y tarifas directamente con nosotras.', 7),
  ('faq-9', '¿Cuáles son sus horarios?', 'Lunes a viernes de 9:00 a 20:00 h · Sábado de 9:00 a 18:00 h · Domingo de 10:00 a 17:00 h.', 8),
  ('faq-10', '¿Puedo regalar una membresía o un servicio?', 'Sí. Contamos con gift cards para servicios individuales y membresías. Es uno de los regalos más valorados. Escríbenos para coordinar.', 9),
  ('faq-11', '¿Los precios incluyen IVA?', 'Todos los precios publicados incluyen IVA. Sin sorpresas al momento de pagar.', 10),
  ('faq-12', '¿Aceptan walk-ins?', 'Dependiendo de la disponibilidad del día podemos recibirte sin reserva, pero no lo garantizamos. Para asegurar tu visita, te recomendamos reservar con anticipación.', 11);

-- ----------------------------------------------------------------------------
-- gestures  (ids gesture-1..gesture-5)
-- ----------------------------------------------------------------------------
insert into gestures (id, number, name, description, sort_order) values
  ('gesture-1', '01', 'Saludo por nombre', '"Buenas tardes, [Nombre]. Bienvenida a Sherry." Cada clienta es recibida de forma personal, nunca genérica.', 0),
  ('gesture-2', '02', 'Guardarropa discreto', 'Tu abrigo y bolso son resguardados con cuidado. Cada pertenencia, tratada con la misma atención que tu visita.', 1),
  ('gesture-3', '03', 'El aroma', 'La fragancia exclusiva Sherry perfuma cada espacio. Un aroma que se convierte en memoria sensorial.', 2),
  ('gesture-4', '04', 'Beverage de bienvenida', 'Té, agua mineral o la bebida especial de la casa. Un gesto que transforma la espera en ritual.', 3),
  ('gesture-5', '05', 'Transición personal', 'Tu especialista te acompaña personalmente a tu estación. Nada se deja al azar.', 4);

-- ----------------------------------------------------------------------------
-- philosophy  (principios; ids principle-1..principle-5)
-- ----------------------------------------------------------------------------
insert into philosophy (id, number, title, body, sort_order) values
  ('principle-1', '01', 'La experiencia es el producto.', 'El servicio técnico es el vehículo. La experiencia completa es el producto real. Uñas perfectas con experiencia ordinaria no generan regreso. Uñas perfectas con experiencia memorable crean embajadoras de por vida.', 0),
  ('principle-2', '02', 'El espacio habla antes que nadie.', 'La arquitectura es el primer y más poderoso mensaje de marca. Cada color, cada luz, cada aroma y cada textura es una oración en el lenguaje de Sherry.', 1),
  ('principle-3', '03', 'La persona que atiende es la marca.', 'Nuestras especialistas son anfitrionas, no técnicas. Cada gesto, cada palabra, cada silencio comunica los valores de Sherry.', 2),
  ('principle-4', '04', 'La coherencia es el lujo.', 'No se puede ser luxury en la comunicación y genérico en el empaque. La coherencia total en cada punto de contacto es lo que define el verdadero lujo.', 3),
  ('principle-5', '05', 'Crecer sin perder el alma.', 'La custodia del ADN de la marca es la responsabilidad más alta. El crecimiento que compromete la identidad es disolución, no expansión.', 4);

-- ----------------------------------------------------------------------------
-- site_settings  (registro único; valores de contacto placeholder)
-- ----------------------------------------------------------------------------
insert into site_settings (id, whatsapp, email, address, instagram, hours) values
  (1, '', '', '', '',
   array['Lun–Vie 9:00–20:00 h','Sáb 9:00–18:00 h','Dom 10:00–17:00 h']);

-- ----------------------------------------------------------------------------
-- staff  (ejemplo)
-- ----------------------------------------------------------------------------
insert into staff (name, role, active, sort_order) values
  ('Valery', 'Especialista senior', true, 0),
  ('Daniela', 'Especialista', true, 1);

-- ----------------------------------------------------------------------------
-- membership_plans  (operación; espeja los 3 planes de marketing)
-- ----------------------------------------------------------------------------
insert into membership_plans (name, price, active) values
  ('RITUAL', 999, true),
  ('MAISON', 1799, true),
  ('SHERRY VIP', 3200, true);

-- ----------------------------------------------------------------------------
-- DATOS DE EJEMPLO (REMOVIBLES) — para que el admin no esté vacío al inicio.
-- Borra este bloque cuando empieces a capturar datos reales.
-- ----------------------------------------------------------------------------
insert into clients (id, name, phone, email, notes, membership_tier)
values ('00000000-0000-0000-0000-000000000001', 'Cliente de Ejemplo', '+52 33 0000 0000', 'ejemplo@correo.com', 'Registro de muestra — eliminar.', null);

-- Cita de ejemplo para HOY a las 12:00 (servicio gelish, 60 min). Removible.
insert into appointments (client_id, client_name, client_phone, service_id, service_name, staff_id, start_at, end_at, status, notes, source)
select
  '00000000-0000-0000-0000-000000000001',
  'Cliente de Ejemplo',
  '+52 33 0000 0000',
  'gelish',
  'Gelish / Color en Gel',
  (select id from staff where name = 'Valery' limit 1),
  (current_date + time '12:00')::timestamptz,
  (current_date + time '13:00')::timestamptz,
  'confirmed',
  'Cita de muestra — eliminar.',
  'admin';
