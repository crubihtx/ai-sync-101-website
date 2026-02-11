# AI Sync 101 Website

Modern, professional single-page website for AI Sync 101 - 20 years of operational expertise, now powered by AI.

## Overview

This website positions AI Sync 101 as a technology company with 20+ years of operational experience, not just another "AI company." Built with clean, modern design inspired by Stripe/Vercel/Linear.

## Features

- **Clean, Modern Design**: Whitespace-heavy, high-contrast design with subtle animations
- **Brand Gradient Colors**: Blue (#00A3FF) to Pink (#FF1F8F) gradient accents
- **Fully Responsive**: Mobile-first design that works on all devices
- **Smooth Scroll Navigation**: Seamless section-to-section navigation
- **Intersection Observer Animations**: Fade-in animations as sections come into view
- **Contact Form**: Ready to integrate with backend API or form service
- **Fast Loading**: Optimized HTML/CSS/JS with no heavy frameworks
- **Accessibility**: Keyboard navigation, ARIA labels, and semantic HTML

## Structure

```
ai-sync-101-website/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles (responsive, animations, etc.)
├── js/
│   └── main.js         # Interactive functionality
├── assets/
│   └── logo.png        # AI Sync 101 logo (needs to be added)
└── README.md           # This file
```

## Setup Instructions

### 1. Add Logo

Place your AI Sync 101 logo in the `assets/` folder:
- Filename: `logo.png`
- Recommended size: 400x400px minimum (will be scaled to 40px height in nav)
- Format: PNG with transparent background

### 2. Local Development

Simply open `index.html` in a web browser:
```bash
open index.html
```

Or use a local server for better performance:

**Using Python:**
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

**Using Node.js (http-server):**
```bash
npx http-server
# Visit http://localhost:8080
```

**Using PHP:**
```bash
php -S localhost:8000
# Visit http://localhost:8000
```

### 3. Deploy to Production

This static website can be deployed to any hosting service:

**Netlify:**
1. Drag and drop the `ai-sync-101-website` folder to Netlify
2. Site is live instantly

**Vercel:**
```bash
npx vercel
```

**GitHub Pages:**
1. Push to GitHub repository
2. Enable GitHub Pages in repo settings
3. Select main branch

**Traditional Hosting:**
- Upload all files via FTP/SFTP to your web host
- Ensure index.html is in the root directory

## Customization

### Contact Form Integration

The contact form is currently set up with placeholder submission. To integrate with your backend:

1. **Using a Form Service (Formspree, Basin, etc.):**
   - Sign up for a form service
   - Replace the form action or update the JavaScript fetch URL
   - Example with Formspree:
     ```html
     <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
     ```

2. **Using Your Own Backend:**
   - Update the `contactForm` submit handler in `js/main.js`
   - Uncomment and modify the fetch request to point to your API endpoint

3. **Using Netlify Forms:**
   - Add `netlify` attribute to the form tag:
     ```html
     <form name="contact" method="POST" netlify>
     ```

### Analytics Integration

To add Google Analytics or other analytics:

1. Add tracking script to `<head>` in `index.html`
2. Uncomment analytics tracking in `js/main.js`
3. Replace placeholder gtag events with your tracking ID

### Color Scheme

Brand colors are defined in CSS variables in `css/styles.css`:

```css
:root {
    --color-blue: #00A3FF;
    --color-pink: #FF1F8F;
    --color-purple: #7B2FFF;
}
```

Modify these to adjust the brand colors throughout the site.

## Content Updates

### Updating Services

Edit the services section in `index.html` (starting at line ~90). Each service card contains:
- Title and subtitle
- Description
- Feature list
- Pricing information

### Updating Case Studies

Edit the case study section in `index.html` (starting at line ~200). Update:
- Company name
- Problem description
- Solution details
- Impact metrics
- Timeline and investment info

### Updating FAQs

Edit the FAQ section in `index.html` (starting at line ~350). Add/remove FAQ items as needed.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Total Page Size**: < 500KB (with optimized logo)

## SEO Optimization

Included SEO features:
- Meta description
- Semantic HTML structure
- Fast loading times
- Mobile-responsive
- Schema.org markup ready

To improve SEO:
1. Add Open Graph tags for social sharing
2. Add Twitter Card tags
3. Create sitemap.xml
4. Add robots.txt
5. Optimize images with alt text

## Maintenance

### Regular Updates
- Update content as services evolve
- Add new case studies
- Keep FAQ section current
- Monitor form submissions

### Security
- If using contact form backend, implement rate limiting
- Add CAPTCHA to prevent spam
- Keep dependencies updated (if you migrate to a framework)

## Support

For questions about the website:
- Review the code comments in HTML/CSS/JS files
- Check browser console for any JavaScript errors
- Ensure logo file is in correct location

## License

© 2026 AI Sync 101. All rights reserved.

Sister company to Louisiana Computer Technologies.
# AI Discovery Widget Deployment
