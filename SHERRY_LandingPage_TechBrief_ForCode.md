# SHERRY LANDING PAGE — BRIEF TÉCNICO PARA DESARROLLO
## Especificaciones Técnicas Completas para Claude Code

---

## 🎨 COLOR PALETTE (Implementación)

```
PRIMARY_BURGUNDY = "#5C1A2E"
PRIMARY_BURGUNDY_LIGHT = "#6D2039"
PRIMARY_BURGUNDY_DARK = "#4A1523"

ACCENT_BONE = "#F5F0E8"
ACCENT_BONE_DARK = "#E8DDD0"
ACCENT_BONE_LIGHT = "#FDFAF2"

ACCENT_GOLD = "#B8963E"
ACCENT_GOLD_LIGHT = "#D4B896"
ACCENT_GOLD_DARK = "#8F6F2D"

NEUTRAL_GRAY = "#8C8680"
NEUTRAL_GRAY_LIGHT = "#B5AFAA"
NEUTRAL_GRAY_DARK = "#6B6560"

BACKGROUND_PRIMARY = "#F5F0E8"
BACKGROUND_SECONDARY = "#FDFAF2"
TEXT_PRIMARY = "#2D2D2D"
TEXT_SECONDARY = "#8C8680"
TEXT_LIGHT = "#F5F0E8"
TEXT_ACCENT = "#B8963E"

BORDER_COLOR = "#D4B896"
BORDER_SUBTLE = "#E8DDD0"
```

---

## 📐 TIPOGRAFÍA

```
FONT_SERIF_MAIN = "Playfair Display" (fallback: Georgia, serif)
  - Weights: 700 (bold), 400 (regular)
  - Usage: H1, H2, H3, Headlines, Brand name

FONT_SERIF_BODY = "Cormorant Garamond" (fallback: "EB Garamond", serif)
  - Weights: 400 (regular), 600 (semibold)
  - Usage: Body text, descriptions, paragraphs

FONT_SANS_DIGITAL = "Montserrat" (fallback: "Optima", sans-serif)
  - Weights: 300 (light), 400 (regular), 600 (semibold)
  - Usage: UI elements, buttons, smaller text, digital-only

SYMBOL = "✦" (Unicode: \u2728 or HTML: &#10032;)
```

---

## 📏 SIZING & SPACING SYSTEM

```
BASE_UNIT = 8px

SPACING = {
  xs: 8px,      // 1 unit
  sm: 16px,     // 2 units
  md: 24px,     // 3 units
  lg: 32px,     // 4 units
  xl: 48px,     // 6 units
  xxl: 64px,    // 8 units
  xxxl: 96px    // 12 units
}

CONTAINER_WIDTH = 1200px (desktop)
CONTAINER_PADDING = 32px (left/right)
CONTAINER_WIDTH_MOBILE = 100%
CONTAINER_PADDING_MOBILE = 16px

BREAKPOINTS = {
  mobile: 320px,
  tablet: 768px,
  desktop: 1024px,
  wide: 1440px
}
```

---

## 🔤 TYPOGRAPHIC SCALE

```
H1 {
  font: 72px Playfair Display Bold;
  line-height: 1.1;
  letter-spacing: -1px;
  color: PRIMARY_BURGUNDY;
  margin-bottom: SPACING.lg;
}

H2 {
  font: 56px Playfair Display Bold;
  line-height: 1.2;
  letter-spacing: -0.5px;
  color: PRIMARY_BURGUNDY;
  margin-bottom: SPACING.md;
}

H3 {
  font: 40px Playfair Display Bold;
  line-height: 1.3;
  color: PRIMARY_BURGUNDY;
  margin-bottom: SPACING.md;
}

H4 {
  font: 28px Playfair Display Regular;
  line-height: 1.4;
  color: PRIMARY_BURGUNDY;
  margin-bottom: SPACING.sm;
}

BODY {
  font: 18px Cormorant Garamond Regular;
  line-height: 1.6;
  color: TEXT_PRIMARY;
  letter-spacing: 0.3px;
}

BODY_SMALL {
  font: 16px Cormorant Garamond Regular;
  line-height: 1.6;
  color: TEXT_SECONDARY;
}

LABEL {
  font: 12px Montserrat Light;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: NEUTRAL_GRAY;
}

BUTTON {
  font: 16px Montserrat SemiBold;
  letter-spacing: 0.5px;
  text-transform: capitalize;
}

MOBILE REDUCTION:
  H1: 48px
  H2: 36px
  H3: 28px
  BODY: 16px
```

---

## 🎯 ESTRUCTURA DE SECCIONES

```
LANDING PAGE ESTRUCTURA:
├─ NAV BAR
├─ SECTION 1: HERO
├─ SECTION 2: PROBLEM STATEMENT
├─ SECTION 3: SOLUTION (QUÉ ES SHERRY)
├─ SECTION 4: THE EXPERIENCE (5 GESTOS)
├─ SECTION 5: SERVICES & PRICING
├─ SECTION 6: MEMBERSHIPS
├─ SECTION 7: PHILOSOPHY (5 PRINCIPIOS)
├─ SECTION 8: TESTIMONIALS
├─ SECTION 9: FAQ
├─ SECTION 10: CALL TO ACTION FINAL
└─ FOOTER
```

---

## 🧭 SECCIÓN 1: NAVIGATION BAR

```
COMPONENT: NavBar
HEIGHT: 80px
BACKGROUND: BACKGROUND_PRIMARY (con subtle border bottom)
BORDER_BOTTOM: 1px solid BORDER_SUBTLE
PADDING: SPACING.md CONTAINER_PADDING
POSITION: sticky (top: 0, z-index: 100)

LAYOUT: flex (justify: space-between, align: center)

LEFT: Logo/Brand
  - Text: "SHERRY ✦"
  - Font: 24px Playfair Display Bold
  - Color: PRIMARY_BURGUNDY
  - Link: href="#"

CENTER: Nav Links (desktop only)
  - Display: none (mobile)
  - Items: ["Experience", "Services", "Membership", "FAQ"]
  - Font: 14px Montserrat Light
  - Color: TEXT_PRIMARY
  - Hover: color PRIMARY_BURGUNDY, underline ACCENT_GOLD (2px)
  - Spacing: SPACING.xl between items

RIGHT: CTA Button
  - Text: "Reserva Ahora"
  - Link: WhatsApp / Calendly (dinamico)
  - Background: PRIMARY_BURGUNDY
  - Color: TEXT_LIGHT
  - Padding: SPACING.sm SPACING.md
  - Border-radius: 0 (square, luxury aesthetic)
  - Hover: background PRIMARY_BURGUNDY_DARK, cursor pointer
  - Font: 12px Montserrat SemiBold

MOBILE:
  - NAV_HEIGHT: 64px
  - Hide center links
  - Hamburger menu icon (3 lines, PRIMARY_BURGUNDY)
  - Mobile menu overlay: full screen, BACKGROUND_PRIMARY, z-index 99
```

---

## 🦸 SECCIÓN 2: HERO

```
COMPONENT: Hero
BACKGROUND_IMAGE: 
  - Image URL: luxury interior shot of Sherry space (warm tones)
  - Fallback color: ACCENT_BONE
  - Overlay: linear-gradient(135deg, rgba(92,26,46,0.3), rgba(184,150,62,0.2))
  - Background-attachment: fixed (parallax on desktop)

LAYOUT: 
  - Min-height: 100vh
  - Display: flex
  - Flex-direction: column
  - Justify-content: center
  - Align-items: center
  - Padding: SPACING.xxxl CONTAINER_PADDING

CONTENT CONTAINER:
  - Max-width: 800px
  - Text-align: center

H1 {
  Text: "Where Beauty Becomes Ritual ✦"
  Font: 72px Playfair Display Bold
  Color: TEXT_LIGHT (white with shadow)
  Text-shadow: 0 2px 8px rgba(0,0,0,0.3)
  Margin-bottom: SPACING.md
}

SUBHEADLINE {
  Text: "La Luxury Beauty House más refinada de Zapopan"
  Font: 24px Cormorant Garamond Regular
  Color: TEXT_LIGHT
  Margin-bottom: SPACING.xl
  Line-height: 1.6
}

BUTTONS CONTAINER:
  - Display: flex
  - Flex-direction: column (mobile), row (desktop)
  - Gap: SPACING.md
  - Justify-content: center

BUTTON_PRIMARY {
  Text: "Reserva Tu Ritual Ahora ✦"
  Background: PRIMARY_BURGUNDY
  Color: TEXT_LIGHT
  Padding: SPACING.md SPACING.xl
  Font: 16px Montserrat SemiBold
  Border: none
  Cursor: pointer
  Hover: background PRIMARY_BURGUNDY_DARK, transform scale(1.05)
  Transition: all 0.3s ease
  Link: WhatsApp (wa.me/PHONE?text=...)
}

BUTTON_SECONDARY {
  Text: "Descubre Membresías"
  Background: transparent
  Color: TEXT_LIGHT
  Border: 2px solid TEXT_LIGHT
  Padding: SPACING.md SPACING.xl
  Font: 16px Montserrat SemiBold
  Hover: background TEXT_LIGHT, color PRIMARY_BURGUNDY
  Transition: all 0.3s ease
}

SCROLL_INDICATOR {
  - Position: absolute (bottom: SPACING.xl)
  - Animation: bounce (2s infinite)
  - Icon: down arrow (↓)
  - Color: TEXT_LIGHT
  - Opacity: 0.7
}

MOBILE:
  - H1: 48px
  - SUBHEADLINE: 18px
  - BUTTONS: flex-direction column
  - BUTTON_WIDTH: 100%
  - Min-height: 80vh
```

---

## 📖 SECCIÓN 3: PROBLEM STATEMENT

```
COMPONENT: ProblemStatement
BACKGROUND: ACCENT_BONE
PADDING: SPACING.xxxl CONTAINER_PADDING
MAX_WIDTH: CONTAINER_WIDTH

LAYOUT:
  - Display: grid
  - Grid-template-columns: 1fr 1fr (desktop), 1fr (mobile)
  - Gap: SPACING.xl
  - Align-items: center

LEFT_COLUMN: Image/Visual
  - Background: linear-gradient(135deg, PRIMARY_BURGUNDY, ACCENT_GOLD)
  - Height: 400px
  - Border-radius: 0 (sharp luxury)
  - Aspect-ratio: 1 (square)
  - Display: flex
  - Align-items: center
  - Justify-content: center
  - Text: "El Problema"
  - Font: 40px Playfair Display Bold
  - Color: TEXT_LIGHT
  - Text-align: center

RIGHT_COLUMN: Content
  - Max-width: 500px

H2 {
  Text: "¿Por qué el lugar donde cuidas tu belleza no puede ser tan refinado como todo lo demás que eliges?"
  Font: 48px Playfair Display Bold
  Color: PRIMARY_BURGUNDY
  Margin-bottom: SPACING.lg
  Line-height: 1.2
}

PARAGRAPH {
  Text: "Las mujeres sofisticadas que consumen lo mejor del mundo —viajan en primera clase, conocen las boutiques de Via Montenapoleone y Rue du Faubourg Saint-Honoré— se conformaban con salones que no estaban a su altura."
  Font: 18px Cormorant Garamond
  Color: TEXT_PRIMARY
  Line-height: 1.8
  Margin-bottom: SPACING.md
}

DIVIDER {
  - Height: 2px
  - Background: ACCENT_GOLD
  - Width: 60px
  - Margin: SPACING.lg 0
}

MOBILE:
  - Grid: 1fr (stacked)
  - Left image: 300px height
  - H2: 36px
  - Paragraph: 16px
```

---

## 🎁 SECCIÓN 4: SOLUTION (QUÉ ES SHERRY)

```
COMPONENT: Solution
BACKGROUND: TEXT_LIGHT (white)
PADDING: SPACING.xxxl CONTAINER_PADDING
TEXT_ALIGN: center

H2 {
  Text: "Sherry: Luxury Beauty House"
  Font: 56px Playfair Display Bold
  Color: PRIMARY_BURGUNDY
  Margin-bottom: SPACING.md
}

SUBTITLE {
  Text: "No es un salón. No es una estética. Es una casa."
  Font: 20px Cormorant Garamond
  Color: TEXT_SECONDARY
  Margin-bottom: SPACING.xl
}

CONTENT {
  Max-width: 900px
  Margin: 0 auto
}

PARAGRAPH {
  Text: "Sherry es una Luxury Beauty House diseñada para transformar los servicios de belleza en rituales de alto refinamiento. Cada detalle —desde la arquitectura hasta el aroma, desde el uniforme de sus especialistas hasta el packaging de sus productos— ha sido concebido para transmitir una sola verdad: aquí, la belleza es un ritual sagrado."
  Font: 18px Cormorant Garamond
  Color: TEXT_PRIMARY
  Line-height: 1.8
  Margin-bottom: SPACING.lg
}

KEY_ATTRIBUTES {
  Display: grid
  Grid-template-columns: repeat(3, 1fr) (desktop), 1fr (mobile)
  Gap: SPACING.xl
  Margin-top: SPACING.xl

  CARD {
    Padding: SPACING.lg
    Background: BACKGROUND_SECONDARY
    Border: 1px solid BORDER_SUBTLE
    
    ICON {
      Font-size: 48px
      Color: ACCENT_GOLD
      Margin-bottom: SPACING.sm
    }
    
    TITLE {
      Font: 20px Playfair Display Bold
      Color: PRIMARY_BURGUNDY
      Margin-bottom: SPACING.xs
    }
    
    TEXT {
      Font: 16px Cormorant Garamond
      Color: TEXT_SECONDARY
      Line-height: 1.6
    }
  }
}

ATTRIBUTES (3 Cards):
1. Arquitectura Emocional
   Icon: 🏠
   Text: "Diseño de interiores con lenguaje editorial de marca"

2. Ritualización del Servicio
   Icon: ✦
   Text: "Protocolos de atención inspirados en hospitalidad ultra-lujo"

3. Identidad Defensible
   Icon: 👑
   Text: "Estética coherente, voz única, packaging premium"

MOBILE:
  - H2: 40px
  - Cards: 1fr
  - Padding: SPACING.md
```

---

## 👋 SECCIÓN 5: THE EXPERIENCE (5 GESTOS)

```
COMPONENT: Experience
BACKGROUND: PRIMARY_BURGUNDY
PADDING: SPACING.xxxl CONTAINER_PADDING
COLOR_SCHEME: dark (text: TEXT_LIGHT)

H2 {
  Text: "Los 5 Gestos de Bienvenida"
  Font: 56px Playfair Display Bold
  Color: TEXT_LIGHT
  Text-align: center
  Margin-bottom: SPACING.xxl
}

SUBTITLE {
  Text: "Cada momento diseñado para confirmar que tomaste la decisión correcta"
  Font: 18px Cormorant Garamond
  Color: ACCENT_BONE
  Text-align: center
  Margin-bottom: SPACING.xl
}

TIMELINE {
  Display: flex
  Flex-direction: column
  Max-width: 800px
  Margin: 0 auto
}

GESTURE_ITEM (x5):
  - Margin-bottom: SPACING.xl
  - Padding: SPACING.lg
  - Background: rgba(245, 240, 232, 0.05)
  - Border-left: 4px solid ACCENT_GOLD
  - Position: relative

GESTURE_NUMBER {
  Position: absolute
  Top: -20px
  Left: SPACING.lg
  Font: 32px Playfair Display Bold
  Background: PRIMARY_BURGUNDY
  Color: ACCENT_GOLD
  Width: 60px
  Height: 60px
  Display: flex
  Align-items: center
  Justify-content: center
  Border: 2px solid ACCENT_GOLD
  Border-radius: 50%
}

GESTURE_TITLE {
  Font: 24px Playfair Display Bold
  Color: ACCENT_GOLD
  Margin-bottom: SPACING.xs
  Margin-left: SPACING.lg
}

GESTURE_TEXT {
  Font: 16px Cormorant Garamond
  Color: TEXT_LIGHT
  Line-height: 1.6
  Margin-left: SPACING.lg
}

GESTURES (Content):
1. "Saludo por nombre" → "Buenas tardes, [Nombre]. Bienvenida a Sherry."
2. "Guardarropa" → "Abrigo y bolsa cuidados con discreción"
3. "El aroma" → "Fragancia exclusiva Sherry del ambiente"
4. "Bebida de bienvenida" → "Té, agua mineral o bebida de la casa"
5. "Transición personal" → "Acompañamiento personalizado a tu ritual"

MOBILE:
  - Max-width: 100%
  - Padding: SPACING.md
  - GESTURE_NUMBER: width 50px, height 50px, font 24px
```

---

## 💎 SECCIÓN 6: SERVICES & PRICING

```
COMPONENT: Services
BACKGROUND: ACCENT_BONE
PADDING: SPACING.xxxl CONTAINER_PADDING

H2 {
  Text: "Rituales & Servicios"
  Font: 56px Playfair Display Bold
  Color: PRIMARY_BURGUNDY
  Text-align: center
  Margin-bottom: SPACING.xxl
}

SERVICE_GRID {
  Display: grid
  Grid-template-columns: repeat(3, 1fr) (desktop), 1fr (mobile)
  Gap: SPACING.xl
  Max-width: 1200px
  Margin: 0 auto
}

SERVICE_CARD {
  Padding: SPACING.lg
  Background: TEXT_LIGHT
  Border: 1px solid BORDER_SUBTLE
  Transition: all 0.3s ease
  Hover: 
    - box-shadow: 0 8px 24px rgba(92, 26, 46, 0.15)
    - transform: translateY(-4px)

SERVICE_ICON {
  Font-size: 48px
  Margin-bottom: SPACING.md
  Color: ACCENT_GOLD
}

SERVICE_TITLE {
  Font: 24px Playfair Display Bold
  Color: PRIMARY_BURGUNDY
  Margin-bottom: SPACING.xs
}

SERVICE_DESCRIPTION {
  Font: 14px Cormorant Garamond
  Color: TEXT_SECONDARY
  Margin-bottom: SPACING.md
  Line-height: 1.6
}

SERVICE_FREQUENCY {
  Font: 12px Montserrat Light
  Color: NEUTRAL_GRAY
  Text-transform: uppercase
  Letter-spacing: 1px
  Margin-bottom: SPACING.md
}

SERVICE_PRICE {
  Font: 32px Playfair Display Bold
  Color: ACCENT_GOLD
  Margin: SPACING.md 0
}

SERVICE_BUTTON {
  Background: PRIMARY_BURGUNDY
  Color: TEXT_LIGHT
  Padding: SPACING.sm SPACING.md
  Font: 12px Montserrat SemiBold
  Border: none
  Cursor: pointer
  Width: 100%
  Hover: background PRIMARY_BURGUNDY_DARK
}

SERVICES (6 Cards):
┌─────────────────────────────────────────────────────┐
│ Gelish / Gel Color                                  │
│ Cada 3-4 semanas                                    │
│ $650 – $850 MXN                                     │
│ [Reservar]                                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Uñas Esculturales                                   │
│ Cada 4-6 semanas                                    │
│ $950 – $1,400 MXN                                   │
│ [Reservar]                                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Manicura Coreana                                    │
│ Cada 3-4 semanas                                    │
│ $750 – $1,100 MXN                                   │
│ [Reservar]                                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Diseños Especiales / 3D                             │
│ Puntual / Eventos                                   │
│ $1,200 – $2,000 MXN                                 │
│ [Reservar]                                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Manicura Clásica Sherry                             │
│ Cada 2-3 semanas                                    │
│ $450 – $600 MXN                                     │
│ [Reservar]                                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Pedicure Premium                                    │
│ Cada 3-6 semanas                                    │
│ $550 – $900 MXN                                     │
│ [Reservar]                                          │
└─────────────────────────────────────────────────────┘

MOBILE:
  - Grid: 1fr
  - SERVICE_PRICE: 24px
  - CARD Padding: SPACING.md
```

---

## 👑 SECCIÓN 7: MEMBERSHIPS

```
COMPONENT: Memberships
BACKGROUND: TEXT_LIGHT
PADDING: SPACING.xxxl CONTAINER_PADDING

H2 {
  Text: "Membresías Sherry ✦"
  Font: 56px Playfair Display Bold
  Color: PRIMARY_BURGUNDY
  Text-align: center
  Margin-bottom: SPACING.md
}

SUBTITLE {
  Text: "Pertenencia a una comunidad selectiva de rituales garantizados"
  Font: 18px Cormorant Garamond
  Color: TEXT_SECONDARY
  Text-align: center
  Margin-bottom: SPACING.xxl
}

MEMBERSHIP_GRID {
  Display: grid
  Grid-template-columns: repeat(3, 1fr) (desktop), 1fr (mobile)
  Gap: SPACING.lg
  Max-width: 1200px
  Margin: 0 auto
}

MEMBERSHIP_CARD {
  Padding: SPACING.xl
  Background: BACKGROUND_SECONDARY
  Border: 2px solid PRIMARY_BURGUNDY
  Position: relative
  Transition: all 0.3s ease
  
  Hover:
    - box-shadow: 0 16px 40px rgba(92, 26, 46, 0.2)
    - transform: translateY(-8px)
    - border-color: ACCENT_GOLD
}

MEMBERSHIP_TIER_LABEL {
  Position: absolute
  Top: -16px
  Left: SPACING.lg
  Font: 12px Montserrat Light
  Background: PRIMARY_BURGUNDY
  Color: TEXT_LIGHT
  Padding: SPACING.xs SPACING.md
  Letter-spacing: 1.5px
  Text-transform: uppercase
}

MEMBERSHIP_NAME {
  Font: 32px Playfair Display Bold
  Color: PRIMARY_BURGUNDY
  Margin-top: SPACING.md
  Margin-bottom: SPACING.xs
}

MEMBERSHIP_PRICE {
  Font: 48px Playfair Display Bold
  Color: ACCENT_GOLD
  Margin-bottom: SPACING.xs
}

MEMBERSHIP_FREQUENCY {
  Font: 14px Montserrat Light
  Color: TEXT_SECONDARY
  Margin-bottom: SPACING.lg
  Letter-spacing: 0.5px
}

MEMBERSHIP_BENEFITS {
  List-style: none
  Padding: 0
  Margin-bottom: SPACING.lg
}

BENEFIT {
  Padding: SPACING.sm 0
  Border-bottom: 1px solid BORDER_SUBTLE
  Font: 16px Cormorant Garamond
  Color: TEXT_PRIMARY
  
  Before {
    Content: "✓"
    Color: ACCENT_GOLD
    Font-weight: bold
    Margin-right: SPACING.xs
  }
}

MEMBERSHIP_VALUE {
  Background: BACKGROUND_PRIMARY
  Padding: SPACING.md
  Border-left: 2px solid ACCENT_GOLD
  Margin: SPACING.lg 0
  Font: 14px Cormorant Garamond
  Color: TEXT_PRIMARY
  Font-style: italic
}

MEMBERSHIP_BUTTON {
  Background: PRIMARY_BURGUNDY
  Color: TEXT_LIGHT
  Width: 100%
  Padding: SPACING.md
  Font: 14px Montserrat SemiBold
  Border: none
  Cursor: pointer
  Transition: all 0.3s
  
  Hover:
    - background: PRIMARY_BURGUNDY_DARK
}

MEMBERSHIPS (3 Cards):

┌──────────────────────────────────────┐
│ RITUAL                               │
│ $999 MXN/mes                         │
│                                      │
│ ✓ 1 manicura gelish al mes           │
│ ✓ 10% descuento en retail            │
│                                      │
│ Ahorra ~$150/mes                     │
│                                      │
│ [Comenzar Ritual]                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ MAISON                               │
│ $1,799 MXN/mes                       │
│ (MOST POPULAR)                       │
│                                      │
│ ✓ 2 manicuras al mes                 │
│ ✓ 1 pedicure express                 │
│ ✓ 15% descuento en retail            │
│ ✓ Prioridad en agenda                │
│                                      │
│ Ahorra ~$400/mes                     │
│                                      │
│ [Elegir Maison]                      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ SHERRY VIP                           │
│ $3,200 MXN/mes                       │
│ EXCLUSIVO                            │
│                                      │
│ ✓ Servicios ilimitados               │
│ ✓ Cabina privada prioritaria         │
│ ✓ Evento exclusivo trimestral        │
│ ✓ Especialista asignada              │
│ ✓ Acceso 24/7 prioritario            │
│                                      │
│ Lo mejor de Sherry                   │
│                                      │
│ [Acceso VIP]                         │
└──────────────────────────────────────┘

MOST_POPULAR_BADGE (on MAISON):
  - Background: ACCENT_GOLD
  - Color: PRIMARY_BURGUNDY
  - Padding: SPACING.xs SPACING.sm
  - Font: 11px Montserrat Bold
  - Text-transform: uppercase
  - Position: absolute (top: -12px, right: SPACING.lg)

MOBILE:
  - Grid: 1fr (stacked)
  - MEMBERSHIP_PRICE: 36px
  - Card padding: SPACING.lg
```

---

## 🏛️ SECCIÓN 8: PHILOSOPHY (5 PRINCIPIOS)

```
COMPONENT: Philosophy
BACKGROUND: BACKGROUND_PRIMARY
PADDING: SPACING.xxxl CONTAINER_PADDING

H2 {
  Text: "El ADN de Sherry"
  Font: 56px Playfair Display Bold
  Color: PRIMARY_BURGUNDY
  Text-align: center
  Margin-bottom: SPACING.md
}

SUBTITLE {
  Text: "5 principios inmutables que definen quiénes somos"
  Font: 18px Cormorant Garamond
  Color: TEXT_SECONDARY
  Text-align: center
  Margin-bottom: SPACING.xxl
}

PRINCIPLES_CONTAINER {
  Max-width: 1000px
  Margin: 0 auto
}

PRINCIPLE_ITEM {
  Margin-bottom: SPACING.xl
  Padding: SPACING.lg
  Background: TEXT_LIGHT
  Border-left: 4px solid ACCENT_GOLD
  
  Hover:
    - box-shadow: 0 4px 16px rgba(92, 26, 46, 0.08)

  Display: grid
  Grid-template-columns: 80px 1fr (desktop), 1fr (mobile)
  Gap: SPACING.lg
  Align-items: flex-start
}

PRINCIPLE_NUMBER {
  Font: 64px Playfair Display Bold
  Color: ACCENT_GOLD
  Opacity: 0.3
}

PRINCIPLE_CONTENT {}

PRINCIPLE_TITLE {
  Font: 24px Playfair Display Bold
  Color: PRIMARY_BURGUNDY
  Margin-bottom: SPACING.sm
}

PRINCIPLE_TEXT {
  Font: 16px Cormorant Garamond
  Color: TEXT_PRIMARY
  Line-height: 1.8
  Margin-bottom: SPACING.sm
}

PRINCIPLE_SUMMARY {
  Font: 14px Montserrat Light
  Color: TEXT_SECONDARY
  Font-style: italic
  Letter-spacing: 0.5px
}

PRINCIPLES (5 Items):

1. LA EXPERIENCIA ES EL PRODUCTO
   "El servicio técnico es el vehículo. La experiencia completa —sensorial, emocional, estética— es el producto real que Sherry vende."

2. EL ESPACIO HABLA ANTES QUE NADIE
   "La arquitectura y el diseño interior son el primer y más poderoso mensaje de marca. Cada decisión de diseño es una oración en el idioma de la marca."

3. LA PERSONA QUE ATIENDE ES LA MARCA
   "Las especialistas de Sherry no son técnicas. Son anfitrionas. Embajadoras de marca con cada gesto, cada palabra, cada silencio."

4. LA COHERENCIA ES EL LUJO
   "Sherry no puede ser luxury en comunicación y genérica en packaging. La coherencia total es lo que convierte una marca bonita en marca de lujo verdadero."

5. CRECER SIN PERDER EL ALMA
   "A medida que Sherry crezca, la custodia del ADN será la responsabilidad más importante. El crecimiento que compromete la identidad es disolución."

MOBILE:
  - Grid: 1fr
  - PRINCIPLE_NUMBER: 48px
  - PRINCIPLE_TITLE: 18px
  - PRINCIPLE_TEXT: 14px
```

---

## ⭐ SECCIÓN 9: TESTIMONIALS & SOCIAL PROOF

```
COMPONENT: Testimonials
BACKGROUND: TEXT_LIGHT
PADDING: SPACING.xxxl CONTAINER_PADDING

H2 {
  Text: "Lo que Dicen Nuestras Clientas"
  Font: 56px Playfair Display Bold
  Color: PRIMARY_BURGUNDY
  Text-align: center
  Margin-bottom: SPACING.md
}

TESTIMONIAL_GRID {
  Display: grid
  Grid-template-columns: repeat(3, 1fr) (desktop), 1fr (mobile)
  Gap: SPACING.xl
  Max-width: 1200px
  Margin: 0 auto
}

TESTIMONIAL_CARD {
  Padding: SPACING.lg
  Background: BACKGROUND_SECONDARY
  Border: 1px solid BORDER_SUBTLE
  Border-radius: 2px

  Hover:
    - box-shadow: 0 8px 24px rgba(92, 26, 46, 0.1)

RATING {
  Color: ACCENT_GOLD
  Font-size: 16px
  Margin-bottom: SPACING.sm
  
  Character: "★★★★★" (5 stars)
}

TESTIMONIAL_TEXT {
  Font: 16px Cormorant Garamond
  Color: TEXT_PRIMARY
  Line-height: 1.8
  Margin-bottom: SPACING.md
  Font-style: italic
}

AUTHOR_NAME {
  Font: 14px Playfair Display Bold
  Color: PRIMARY_BURGUNDY
}

AUTHOR_DETAIL {
  Font: 12px Montserrat Light
  Color: TEXT_SECONDARY
  Letter-spacing: 0.5px
}

TESTIMONIALS (3 Cards - Placeholder):

┌────────────────────────────────────┐
│ ★★★★★                             │
│                                    │
│ "Mi primer ritual en Sherry fue    │
│ exactamente lo que necesitaba: un  │
│ espacio donde mi tiempo es honrado │
│ y mi belleza es sagrada."          │
│                                    │
│ — María G.                         │
│   Zapopan                          │
└────────────────────────────────────┘

[REPEAT x3 with different testimonials]

STATS_SECTION {
  Display: grid
  Grid-template-columns: repeat(4, 1fr) (desktop), repeat(2, 1fr) (tablet), 1fr (mobile)
  Gap: SPACING.lg
  Margin-top: SPACING.xxl
  Padding-top: SPACING.xl
  Border-top: 2px solid BORDER_SUBTLE

  STAT {
    Text-align: center
    
    STAT_NUMBER {
      Font: 48px Playfair Display Bold
      Color: ACCENT_GOLD
    }
    
    STAT_LABEL {
      Font: 14px Montserrat Light
      Color: TEXT_SECONDARY
      Text-transform: uppercase
      Letter-spacing: 1px
    }
  }
}

STATS (4 items):
- "150+" "Membresías Activas"
- "95" "Promedio NPS"
- "500+" "Clientas Satisfechas"
- "24/7" "Disponibles"

MOBILE:
  - Testimonial cards: 1fr
  - Stats: 2 columns (tablet), 1 column (mobile)
```

---

## ❓ SECCIÓN 10: FAQ

```
COMPONENT: FAQ
BACKGROUND: ACCENT_BONE
PADDING: SPACING.xxxl CONTAINER_PADDING

H2 {
  Text: "Preguntas Frecuentes"
  Font: 56px Playfair Display Bold
  Color: PRIMARY_BURGUNDY
  Text-align: center
  Margin-bottom: SPACING.xxl
}

FAQ_CONTAINER {
  Max-width: 900px
  Margin: 0 auto
}

FAQ_ITEM {
  Margin-bottom: SPACING.lg
  Border-bottom: 1px solid BORDER_SUBTLE
  
  Last-child:
    - border-bottom: none
}

FAQ_QUESTION {
  Padding: SPACING.lg SPACING.md
  Display: flex
  Justify-content: space-between
  Align-items: center
  Cursor: pointer
  Background: TEXT_LIGHT
  Transition: all 0.3s ease
  
  Hover:
    - background: BACKGROUND_SECONDARY

  Font: 18px Playfair Display Bold
  Color: PRIMARY_BURGUNDY
}

FAQ_TOGGLE_ICON {
  Font-size: 24px
  Color: ACCENT_GOLD
  Transition: transform 0.3s ease
  
  Open (rotated):
    - transform: rotate(180deg)
}

FAQ_ANSWER {
  Padding: 0 SPACING.md SPACING.lg SPACING.md
  Display: none
  Font: 16px Cormorant Garamond
  Color: TEXT_PRIMARY
  Line-height: 1.8
  
  Active (display: block):
    - Animation: slideDown 0.3s ease
}

@keyframes slideDown:
  from:
    - opacity: 0
    - transform: translateY(-10px)
  to:
    - opacity: 1
    - transform: translateY(0)

FAQ_ITEMS (12+ items):

Q: ¿Qué es Sherry exactamente?
A: Sherry es una Luxury Beauty House. No es un salón ni una estética. Es una casa dedicada a elevar los rituales de belleza femenina mediante experiencias premium con estándares de lujo internacional.

Q: ¿Quién es la clienta ideal de Sherry?
A: Mujeres de 28 a 55 años con NSE C+ a AB. Empresarias, directivas, emprendedoras, profesionistas activas. Mujeres que consumen experiencias premium y entienden el valor del ritual.

Q: ¿Cuál es el horario?
A: Lunes a viernes 9:00–20:00h, sábado 9:00–18:00h, domingo 10:00–17:00h.

Q: ¿Necesito reservar con anticipación?
A: Sí. La reserva garantiza la dedicación completa de tu especialista y tu espacio.

Q: ¿Puedo cancelar mi membresía?
A: Sí. Con aviso de 30 días. Las membresías no tienen penalidad de cancelación.

Q: ¿Qué métodos de pago aceptan?
A: Efectivo, tarjeta de débito/crédito y transferencia. Para membresías: cargo recurrente.

Q: ¿Qué sucede si no quedé satisfecha?
A: Sherry garantiza tu satisfacción. Si algo no cumplió tus expectativas, lo resolvemos sin condiciones.

Q: ¿Cuál es la diferencia entre los servicios?
A: [Explicar servicios con tabla comparativa]

Q: ¿Qué membresía me recomiendan?
A: Depende de tu frecuencia. Ritual para visitas ocasionales, Maison para recurrentes, VIP para máxima dedicación.

Q: ¿Cómo es la experiencia completa?
A: Comienza con los 5 gestos de bienvenida: saludo por nombre, guardarropa, aroma, bebida, transición personal.

Q: ¿Puedo hacer preguntas especiales?
A: Claro. Escríbenos por WhatsApp y respondemos en menos de 2 horas.

Q: ¿Hay programa de referidos?
A: Sí. Comparte Sherry y tú y tu amiga reciben beneficios exclusivos.

MOBILE:
  - FAQ_QUESTION: 16px
  - FAQ_ANSWER: 14px
  - Padding adjusted for mobile
```

---

## 🎯 SECCIÓN 11: FINAL CTA

```
COMPONENT: FinalCTA
BACKGROUND: PRIMARY_BURGUNDY
PADDING: SPACING.xxxl CONTAINER_PADDING
COLOR_SCHEME: dark (text: TEXT_LIGHT)
TEXT_ALIGN: center
MIN_HEIGHT: 60vh
DISPLAY: flex
FLEX_DIRECTION: column
JUSTIFY_CONTENT: center
ALIGN_ITEMS: center

H2 {
  Text: "Tu Primer Ritual Te Espera"
  Font: 56px Playfair Display Bold
  Color: TEXT_LIGHT
  Margin-bottom: SPACING.md
}

SUBTITLE {
  Text: "No somos para todas. Somos exactamente para las que nos entienden sin que tengamos que explicarnos."
  Font: 20px Cormorant Garamond
  Color: ACCENT_BONE
  Max-width: 600px
  Margin: 0 auto SPACING.xl
  Line-height: 1.8
}

QUOTE_DIVIDER {
  Height: 2px
  Width: 60px
  Background: ACCENT_GOLD
  Margin-bottom: SPACING.xl
}

BUTTONS_CONTAINER {
  Display: flex
  Flex-direction: column (mobile), row (desktop)
  Gap: SPACING.lg
  Justify-content: center
}

BUTTON_PRIMARY {
  Text: "Reserva Tu Ritual Ahora ✦"
  Background: ACCENT_GOLD
  Color: PRIMARY_BURGUNDY
  Padding: SPACING.md SPACING.xl
  Font: 16px Montserrat SemiBold
  Border: none
  Cursor: pointer
  Transition: all 0.3s
  
  Hover:
    - background: ACCENT_GOLD_LIGHT
    - transform: scale(1.05)
}

BUTTON_SECONDARY {
  Text: "Descubre Membresías"
  Background: transparent
  Color: TEXT_LIGHT
  Border: 2px solid TEXT_LIGHT
  Padding: SPACING.md SPACING.xl
  Font: 16px Montserrat SemiBold
  Cursor: pointer
  Transition: all 0.3s
  
  Hover:
    - background: TEXT_LIGHT
    - color: PRIMARY_BURGUNDY
}

CONTACT_INFO {
  Margin-top: SPACING.xl
  Font: 14px Montserrat Light
  Color: ACCENT_BONE
  
  Text: "¿Preguntas? Escríbenos. Respondemos en menos de 2 horas."
}

MOBILE:
  - H2: 40px
  - BUTTONS: flex-direction column
  - BUTTON_WIDTH: 100%
  - Min-height: 50vh
  - Padding: SPACING.lg
```

---

## 🏷️ FOOTER

```
COMPONENT: Footer
BACKGROUND: TEXT_PRIMARY (#2D2D2D)
PADDING: SPACING.xl CONTAINER_PADDING
COLOR_SCHEME: light

FOOTER_GRID {
  Display: grid
  Grid-template-columns: repeat(4, 1fr) (desktop), repeat(2, 1fr) (tablet), 1fr (mobile)
  Gap: SPACING.xl
  Max-width: CONTAINER_WIDTH
  Margin: 0 auto SPACING.xl
}

FOOTER_COLUMN_TITLE {
  Font: 14px Montserrat Bold
  Color: ACCENT_GOLD
  Text-transform: uppercase
  Letter-spacing: 1.5px
  Margin-bottom: SPACING.md
}

FOOTER_LINK {
  Font: 14px Cormorant Garamond
  Color: ACCENT_BONE
  Line-height: 2
  Cursor: pointer
  Transition: all 0.3s
  
  Hover:
    - color: ACCENT_GOLD
}

FOOTER_SECTION_1: ABOUT
  - "Sherry ✦"
  - "Luxury Beauty House"
  - "Donde la belleza se convierte en ritual"

FOOTER_SECTION_2: SERVICES
  - "Gelish"
  - "Manicura Coreana"
  - "Pedicure Premium"
  - "Diseños Especiales"

FOOTER_SECTION_3: COMPANY
  - "Reserva"
  - "Membresías"
  - "Gift Cards"
  - "FAQ"

FOOTER_SECTION_4: CONTACT
  - "WhatsApp: [Número]"
  - "Teléfono: [Número]"
  - "Instagram: @sherrymexico"
  - "Ubicación: Zapopan, Jalisco"

FOOTER_BOTTOM {
  Display: flex
  Justify-content: space-between
  Align-items: center
  Border-top: 1px solid NEUTRAL_GRAY
  Padding-top: SPACING.lg
  Margin-top: SPACING.xl
}

FOOTER_COPY {
  Font: 12px Montserrat Light
  Color: NEUTRAL_GRAY
}

SOCIAL_LINKS {
  Display: flex
  Gap: SPACING.md
}

SOCIAL_ICON {
  Font-size: 20px
  Color: ACCENT_GOLD
  Cursor: pointer
  Transition: all 0.3s
  
  Hover:
    - color: ACCENT_BONE
}

MOBILE:
  - Grid: 1fr
  - Spacing: SPACING.lg
  - Footer_bottom: flex-direction column
```

---

## 🔗 LINKS & BUTTONS (GLOBAL)

```
BUTTON_STYLING:
- Border-radius: 0 (square, luxury aesthetic)
- Transition: all 0.3s ease
- Font-weight: 600
- Letter-spacing: 0.5px
- Text-transform: capitalize

PRIMARY_BUTTON:
  Background: PRIMARY_BURGUNDY
  Color: TEXT_LIGHT
  Hover: background PRIMARY_BURGUNDY_DARK, box-shadow 0 4px 12px rgba(92,26,46,0.3)

SECONDARY_BUTTON:
  Background: transparent
  Color: PRIMARY_BURGUNDY
  Border: 2px solid PRIMARY_BURGUNDY
  Hover: background PRIMARY_BURGUNDY, color TEXT_LIGHT

GOLD_BUTTON:
  Background: ACCENT_GOLD
  Color: PRIMARY_BURGUNDY
  Hover: background ACCENT_GOLD_LIGHT

TEXT_LINK:
  Color: PRIMARY_BURGUNDY
  Text-decoration: none
  Border-bottom: 1px solid PRIMARY_BURGUNDY
  Hover: color ACCENT_GOLD, border-color ACCENT_GOLD
```

---

## 📱 RESPONSIVE BREAKPOINTS

```
DESKTOP: min-width 1024px
  - Full layout as designed
  - Multi-column grids
  - All typography at 100%

TABLET: 768px - 1023px
  - 2-column grids (where applicable)
  - Padding reduced to SPACING.md
  - Typography scale 90%
  - Hero H1: 56px

MOBILE: max-width 767px
  - 1-column layouts (stacked)
  - Full-width containers
  - Padding: SPACING.md
  - Typography scale 85%
  - Hero H1: 48px
  - Buttons: 100% width
  - Hide complex layouts
  - Hamburger menu for navigation

MOBILE-SMALL: max-width 480px
  - Typography scale 80%
  - Hero H1: 40px
  - Spacing reduced to SPACING.sm where possible
  - Single-column everything
```

---

## ✨ ANIMATIONS & INTERACTIONS

```
SCROLL_ANIMATIONS:
  - Fade-in on scroll (opacity 0 → 1)
  - Slide-up on scroll (translateY 20px → 0)
  - Duration: 0.6s
  - Easing: ease-out
  - Trigger: when element 20% in viewport

HOVER_EFFECTS:
  - Cards: elevation (box-shadow), slight translateY (-4px)
  - Links: color change to ACCENT_GOLD, underline
  - Buttons: background shift, scale(1.05), shadow
  - Duration: 0.3s

FORM_INTERACTIONS:
  - Input focus: border-color PRIMARY_BURGUNDY, box-shadow subtle
  - Placeholder: color TEXT_SECONDARY, fade on focus
  - Error: border-color red, shake animation

LOADING_STATE:
  - Spinner: circular, ACCENT_GOLD
  - Text: "Cargando..." (Montserrat Light)
  - Duration: smooth infinite rotation
```

---

## 🔍 SEO & META TAGS

```
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sherry | Luxury Beauty House en Zapopan</title>
    <meta name="description" content="Sherry: donde la belleza se convierte en ritual. Luxury Beauty House con servicios premium de uñas, manicura coreana y membresías exclusivas en Zapopan, Jalisco.">
    <meta name="keywords" content="luxury beauty, manicura premium, uñas gel, zapopan, belleza lujo, salon estetica">
    <meta property="og:title" content="Sherry | Where Beauty Becomes Ritual ✦">
    <meta property="og:description" content="Luxury Beauty House en Zapopan. Rituales de belleza premium con estándares internacionales.">
    <meta property="og:image" content="[URL de imagen hero]">
    <meta property="og:url" content="https://sherry.com.mx">
    <meta name="twitter:card" content="summary_large_image">
  </head>
</html>
```

---

## 📊 ANALYTICS TRACKING

```
EVENTS_TO_TRACK:
  - Page view (all)
  - Scroll depth (25%, 50%, 75%, 100%)
  - Button clicks: "Reserva Ahora" (CTA primary)
  - Button clicks: "Descubre Membresías"
  - Form submission (contact)
  - External link clicks (WhatsApp, Instagram)
  - Video play (if embedded)
  - Scroll to sections (by ID)

CONVERSION_GOALS:
  1. WhatsApp click (warm lead)
  2. Membership page visit (high-intent)
  3. FAQ expansion (consideration)
  4. Form submission (high-intent)

PIXELS:
  - Facebook Pixel (conversion tracking)
  - Google Analytics 4 (session, user behavior)
  - Google Ads Conversion Tracking (ad attribution)
```

---

## 🎬 MEDIA ASSETS NEEDED

```
HERO_IMAGE:
  - Size: 1920x1080px (minimum)
  - Format: WebP (fallback JPG)
  - Description: Luxury interior of Sherry space (warm, intimate lighting)
  - Color tone: Warm, burgundy-gold tones, natural light
  - Style: Cinematic, editorial, not commercial photography

SERVICE_IMAGES (6):
  - Size: 800x600px each
  - Format: WebP/JPG
  - Style: Detail shots, hands, products, close-up luxury textures
  - Color: Match palette (Burgundy, Bone, Gold)

TESTIMONIAL_IMAGES (3):
  - Size: 200x200px (circular crops)
  - Format: JPG
  - Style: Headshots, real customers, warm professional photography

ICONS (SVG):
  - Sizes: 48px, 64px
  - Style: Minimalist, luxury aesthetic
  - Color: ACCENT_GOLD (#B8963E)
  - Icons needed: check, star, heart, arrow, menu, close, etc.

VIDEO (optional):
  - Duration: 30-60 seconds
  - Format: MP4, WebM
  - Description: Luxury space tour or testimonial reel
  - Audio: Subtle instrumental, no harsh sounds
```

---

## 🚀 DEPLOYMENT INSTRUCTIONS

```
PERFORMANCE_TARGETS:
  - Page Load Time: < 3 seconds (mobile), < 2 seconds (desktop)
  - Lighthouse Score: > 90 (Performance, Accessibility, Best Practices, SEO)
  - Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

OPTIMIZATION:
  - Images: WebP format, compressed, lazy-loaded
  - CSS: Minified, critical CSS inlined
  - JavaScript: Minified, defer non-critical
  - CDN: Serve assets from CDN (Cloudflare, AWS CloudFront)
  - Caching: Browser caching headers, 1 month for static assets

HOSTING:
  - Platform: Vercel / Netlify (recommended for React)
  - OR: AWS S3 + CloudFront (for static HTML)
  - HTTPS: Required
  - Domain: sherry.com.mx or similar

FORM_SUBMISSIONS:
  - Backend: Formspree, Netlify Forms, or custom API
  - Email notifications to: [contact email]
  - CRM integration: Zapier → WhatsApp / Email automation

WHATSAPP_INTEGRATION:
  - Link format: https://wa.me/[PHONE_NUMBER]?text=[ENCODED_MESSAGE]
  - Default message: "Hola, quiero reservar mi ritual en Sherry"
  - Phone number: [Insert actual Sherry WhatsApp number]
```

---

## 📋 FINAL CHECKLIST PARA DESARROLLO

```
□ Color palette definida en variables CSS
□ Tipografía implementada (Playfair + Cormorant + Montserrat)
□ NavBar sticky responsive (desktop menu hidden on mobile)
□ Hero section con parallax scroll effect
□ Problem statement con grid layout
□ Solution section con 3-column card grid
□ Experience section con 5-gesture timeline
□ Services grid (6 cards, responsive)
□ Memberships section (3 cards, responsive, highlight MAISON)
□ Philosophy section (5 principles with numbered layout)
□ Testimonials grid (3 cards + stats section)
□ FAQ accordion (expandable items)
□ Final CTA section (dark background, prominent buttons)
□ Footer (4-column grid, responsive)
□ Mobile navigation (hamburger menu)
□ Form handling (contact / reservation)
□ WhatsApp integration (dynamic links)
□ Google Analytics tracking
□ Meta tags & SEO optimization
□ Image optimization (WebP, compressed, lazy-loaded)
□ Performance optimization (< 3s load time)
□ Accessibility audit (WCAG 2.1 AA)
□ Cross-browser testing (Chrome, Safari, Firefox, Edge)
□ Mobile testing (iPhone, Android devices)
□ Deployment to live domain
□ SSL certificate installed
□ Domain email setup
□ Monitoring & error tracking
```

---

**END OF TECHNICAL BRIEF**

*This document is AI-ready. Paste this into Claude Code or any AI developer for immediate implementation.*
