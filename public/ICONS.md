# NostrEats Icons

## Quick Start

### Automatic Generation (Recommended)
1. Navigate to `/generate-icons` in your browser
2. Click "Download All Icons"
3. Move the downloaded PNG files to the `/public` directory
4. Rebuild the project

### Required Files
- `icon-192.png` - 192x192px PNG (for manifest and PWA)
- `icon-512.png` - 512x512px PNG (for manifest and PWA)
- `favicon-16x16.png` - 16x16px PNG (browser tab)
- `favicon-32x32.png` - 32x32px PNG (browser tab)
- `apple-touch-icon.png` - 180x180px PNG (iOS home screen)
- `og-image.png` - 1200x630px PNG (social media sharing - needs manual creation)

### Design Specification
- **Primary Color**: #f97316 (orange)
- **Accent Color**: #fbbf24 (amber/gold for lightning)
- **Icon**: Crossed fork & knife with lightning bolt at bottom
- **Style**: Modern, minimalist, clean
- **Background**: Solid orange circle

### Current Status
- ✅ `favicon.svg` - Created (SVG version)
- ✅ Icon generator - Available at `/generate-icons`
- ⏳ PNG icons - Generate using `/generate-icons` page
- ⏳ OG image - Needs manual creation (1200x630px)

### OG Image
For social media sharing, create a 1200x630px image with:
- NostrEats branding
- "Zap-Powered Restaurant Reviews" tagline
- Orange/amber color scheme
- Fork/knife icon with lightning bolt

Place as `/public/og-image.png` and update meta tags in `index.html`.

Once generated, place all files in the `/public` directory.
