# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartStow is a static landing page for a mobile app that helps users organize belongings through voice recording. The site is owned by **The Good Business Software Company Inc.** and deployed via GitHub Pages at `smartstowapp.com`.

This is a pure HTML/CSS/JavaScript static website with no build process or dependencies.

## Development Commands

### Local Development
```bash
# Serve locally using Python
python3 -m http.server 8000

# Serve locally using Node.js
npx http-server

# Serve locally using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

### Deployment
The site is deployed automatically via GitHub Pages from the main branch. The `CNAME` file configures the custom domain `smartstowapp.com`.

## Architecture

### File Structure
- `index.html` - Main landing page with semantic HTML5
- `styles.css` - All styling including responsive design, glassmorphism effects
- `script.js` - Interactive features (smooth scroll, intersection observer animations)
- `privacy-policy.html` - Privacy policy page
- `terms-and-conditions.html` - Terms & conditions page
- `CNAME` - GitHub Pages custom domain configuration

### Design System

**CSS Variables (in `:root`):**
- Primary colors: `--primary-color` (black), `--secondary-color` (dark gray)
- Text colors: `--text-dark`, `--text-light`
- Glassmorphism: `--glass-light`, `--glass-medium`, `--glass-strong`, `--glass-dark` variants
- Shadows: `--shadow`, `--shadow-lg`

**Key Design Patterns:**
- Glassmorphism effects using `backdrop-filter: blur()` throughout
- Gradient backgrounds in hero and footer sections
- Sticky navigation with blur effect
- Responsive grid layout (desktop 2-column, mobile single column)

### JavaScript Architecture

**script.js** contains vanilla JavaScript (no frameworks):
1. **Smooth scrolling** - Handles anchor link navigation with navbar offset compensation
2. **Intersection Observer** - Animates feature cards on scroll into view
3. **Store button handlers** - Placeholder alerts for future app store integration
4. **Dynamic styles** - Injects CSS for scroll animations

**Animation Flow:**
- Cards in viewport on load: immediate display without animation
- Cards below viewport: opacity 0 → fade in on scroll using IntersectionObserver

### Responsive Breakpoints
- Desktop: default (max-width: 1200px container)
- Tablet: `@media (max-width: 768px)` - single column hero, stacked features
- Mobile: `@media (max-width: 480px)` - smaller text, full-width buttons

## Page Sections

The landing page (`index.html`) follows this structure:
1. **Header** - Sticky navbar with logo and navigation links
2. **Hero** - Two-column layout with CTA buttons and phone mockup
3. **Features** - Grid of 4 feature cards (voice, database, search, cross-platform)
4. **Download** - App store buttons (currently placeholders showing "Coming Soon")
5. **About** - Company information
6. **Footer** - Copyright, links to privacy policy and terms

## Important Conventions

- **No build tools or package managers** - Pure static HTML/CSS/JS
- **System font stack** - Uses native fonts for performance
- **Glassmorphism aesthetic** - Consistent use of backdrop-filter and rgba colors
- **Accessibility** - Semantic HTML5, proper heading hierarchy
- **Mobile-first considerations** - Responsive design with multiple breakpoints

## Future Integration Points

- Store button click handlers in `script.js:62-69` ready for real App Store/Google Play URLs
- "Coming Soon" message in download section can be removed when apps launch
- Custom domain DNS must be configured to point to GitHub Pages
