# Sherry Favicon Design Spec

This document details the design and implementation of a custom favicon for the Sherry Luxury Beauty House landing page.

## Selected Design: Option A

The user approved Option A:
- **Background**: Solid rounded square in Burgundy `#5C1A2E` (the project's signature red color).
- **Foreground**: Elegant serif letter **S** in Gold `#B8963E` placed in the center.
- **Font style**: A premium serif font (Cormorant Garamond / Playfair Display / Georgia) to match the luxury brand identity.

## Proposed Changes

### [MODIFY] [favicon.svg](file:///c:/Users/Perez/OneDrive/Escritorio/Projects/SherryLanding/public/favicon.svg)
Update the current `favicon.svg` with the new design:
- Background: `<rect width="32" height="32" rx="6" fill="#5C1A2E"/>`
- Font and character: `<text x="16" y="23" text-anchor="middle" font-family="'Cormorant Garamond', 'Playfair Display', Georgia, serif" font-weight="bold" font-size="20" fill="#B8963E">S</text>`

## Verification Plan

### Automated Tests
- None.

### Manual Verification
- Check that the new SVG displays properly in standard browser previews.
- Ensure the icon is visible in both light and dark browser themes.
