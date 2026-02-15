# Copilot Instructions for SmartStow Landing Page

## Repository Overview

This repository contains the landing page for **SmartStow**, an application that helps users organize their belongings by allowing them to verbally record where items are stored. The landing page is a static website deployed via GitHub Pages at `smartstowapp.com`.

**Company**: The Good Business Software Company Inc.

## Technology Stack

- **HTML5**: Semantic markup for structure
- **CSS3**: Modern styling with flexbox/grid layouts and responsive design
- **Vanilla JavaScript**: Interactive features and smooth scrolling
- **GitHub Pages**: Static site hosting with custom domain

## File Structure

```
/
├── index.html      # Main landing page with hero, features, download, and about sections
├── styles.css      # All styling including responsive design and animations
├── script.js       # Interactive features like smooth scrolling
├── CNAME           # Custom domain configuration for GitHub Pages
└── README.md       # Project documentation
```

## Development Guidelines

### Code Style

#### HTML
- Use semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<footer>`)
- Maintain proper indentation (4 spaces)
- Include appropriate meta tags for SEO and responsive design
- Use descriptive class names that follow BEM-like conventions

#### CSS
- Keep all styles in a single `styles.css` file for simplicity
- Use CSS custom properties for colors and repeated values
- Implement mobile-first responsive design with media queries
- Group related styles together with clear comments
- Maintain consistent spacing and indentation

#### JavaScript
- Write clean, vanilla JavaScript (no frameworks)
- Use modern ES6+ syntax where appropriate
- Keep code modular and well-commented
- Ensure cross-browser compatibility

### Responsive Design

- Design mobile-first, then add styles for larger screens
- Test on multiple device sizes
- Ensure touch-friendly interactions on mobile devices
- Optimize images and assets for performance

### Content Guidelines

- Maintain professional, user-friendly copy
- Emphasize the voice recording and search capabilities
- Keep branding consistent (SmartStow by The Good Business Software Company Inc.)
- Use emoji icons consistently (🎙️, 🗄️, 🔍, 📱)

## Local Development

To test changes locally:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in a browser.

## Deployment

- The site is automatically deployed via GitHub Pages
- Changes pushed to the main branch will be live shortly after
- The CNAME file configures the custom domain `smartstowapp.com`
- No build process is required (static HTML/CSS/JS)

## Testing

Since this is a static landing page:
- **Manual testing**: Open index.html in browsers (Chrome, Firefox, Safari, Edge)
- **Responsive testing**: Test on different screen sizes using browser dev tools
- **Link testing**: Verify all navigation links work correctly
- **Visual testing**: Ensure styling appears correctly across browsers

## Making Changes

When modifying this repository:

1. **Small changes only**: This is a simple landing page - avoid over-engineering
2. **Preserve existing structure**: Maintain the single-page layout with sections
3. **Test locally first**: Always verify changes in a browser before committing
4. **Keep it lightweight**: Avoid adding heavy dependencies or frameworks
5. **Maintain accessibility**: Ensure proper semantic HTML and ARIA labels where needed
6. **Consider mobile users**: Test responsive behavior on small screens

## Common Tasks

### Adding a new section
- Add a new `<section>` in index.html with appropriate id
- Add corresponding styles in styles.css
- Update navigation links if needed

### Updating content
- Edit text directly in index.html
- Maintain consistent voice and branding
- Keep sections balanced in length

### Styling changes
- Add/modify styles in styles.css
- Test responsive behavior with media queries
- Ensure changes work across browsers

### Interactive features
- Add JavaScript functions to script.js
- Keep interactions simple and performant
- Test on mobile devices

## Notes

- This is a **coming soon** page - the app download links are placeholders
- Focus on simplicity and performance
- The site should load quickly and work on all devices
- Maintain the professional, clean aesthetic
