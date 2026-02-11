# Deployment Guide - AI Sync 101 Website

This guide covers deploying your AI Sync 101 website to various hosting platforms.

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Logo file (`logo.png`) is in the `assets/` folder
- [ ] Contact form is integrated with backend or form service
- [ ] All content is reviewed and accurate
- [ ] Test on mobile devices and different browsers
- [ ] Analytics tracking is set up (if desired)

## Quick Deploy Options

### Option 1: Netlify (Recommended for Speed)

**Easiest deployment method:**

1. Go to [netlify.com](https://netlify.com)
2. Sign up or log in
3. Drag and drop the `ai-sync-101-website` folder onto Netlify
4. Your site is live instantly with HTTPS

**Benefits:**
- Free tier available
- Automatic HTTPS
- Global CDN
- Form handling built-in (no backend needed)
- Continuous deployment from Git

**To use Netlify Forms:**
Add this to your form tag in index.html:
```html
<form name="contact" method="POST" netlify>
```

### Option 2: Vercel

**For modern hosting with edge capabilities:**

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to website folder: `cd ai-sync-101-website`
3. Run: `vercel`
4. Follow prompts to deploy

**Benefits:**
- Free tier available
- Excellent performance
- Automatic HTTPS
- Edge network

### Option 3: GitHub Pages

**For free hosting via GitHub:**

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   cd ai-sync-101-website
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Go to repository Settings > Pages
4. Select main branch as source
5. Your site will be at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

**Limitations:**
- No built-in form handling (need external service)
- May need to update paths if deployed to subdirectory

### Option 4: Traditional Web Hosting

**For cPanel/FTP hosting:**

1. Connect to your hosting via FTP client (FileZilla, Cyberduck, etc.)
2. Upload all files to `public_html` or `www` folder
3. Ensure `index.html` is in the root directory
4. Site is live at your domain

**Required:**
- Web hosting account with FTP access
- Your domain name pointed to hosting

## Custom Domain Setup

### Netlify Custom Domain

1. Go to Site Settings > Domain Management
2. Click "Add custom domain"
3. Add your domain (e.g., `aisync101.com`)
4. Follow DNS configuration instructions
5. HTTPS is automatic

### Vercel Custom Domain

1. Go to project Settings > Domains
2. Add your domain
3. Configure DNS records as shown
4. HTTPS is automatic

### GitHub Pages Custom Domain

1. Add CNAME file with your domain
2. Configure DNS at your domain registrar:
   - Add A records to GitHub's IPs
   - Or CNAME to `YOUR_USERNAME.github.io`
3. Enable HTTPS in repository settings

## Contact Form Backend Options

### Option 1: Formspree (Easiest)

1. Sign up at [formspree.io](https://formspree.io)
2. Create new form
3. Update form in `index.html`:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

**Free tier:** 50 submissions/month

### Option 2: Basin

1. Sign up at [usebasin.com](https://usebasin.com)
2. Create new form
3. Update form action URL

**Free tier:** 100 submissions/month

### Option 3: Netlify Forms

If deploying to Netlify:
1. Add `netlify` attribute to form
2. Submissions appear in Netlify dashboard
3. Email notifications available

**Free tier:** 100 submissions/month

### Option 4: Custom Backend

For full control, create your own backend:

1. **Node.js/Express example:**
   ```javascript
   app.post('/api/contact', async (req, res) => {
     // Send email via SendGrid, AWS SES, etc.
     // Store in database
     // Send to CRM
   });
   ```

2. Update `js/main.js` to point to your API endpoint

3. Deploy backend to:
   - AWS Lambda + API Gateway
   - Google Cloud Functions
   - Heroku
   - Your own server

## Post-Deployment Tasks

### 1. Test Everything

- [ ] Test all navigation links
- [ ] Submit test form
- [ ] Check mobile responsiveness
- [ ] Test on multiple browsers
- [ ] Verify logo loads correctly
- [ ] Check all sections scroll smoothly

### 2. Set Up Analytics

**Google Analytics 4:**
1. Create GA4 property
2. Add tracking code to `<head>` in `index.html`:
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

### 3. SEO Enhancements

**Add to `<head>` in index.html:**

```html
<!-- Open Graph -->
<meta property="og:title" content="AI Sync 101 - 20 Years Building Operational Systems">
<meta property="og:description" content="We solve expensive operational problems for mid-market companies with custom platforms and intelligent automation.">
<meta property="og:image" content="https://yoursite.com/assets/og-image.png">
<meta property="og:url" content="https://yoursite.com">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="AI Sync 101 - 20 Years Building Operational Systems">
<meta name="twitter:description" content="Custom operational platforms powered by 20+ years of experience">
<meta name="twitter:image" content="https://yoursite.com/assets/twitter-card.png">
```

**Create sitemap.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yoursite.com/</loc>
    <lastmod>2026-02-10</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

**Create robots.txt:**
```
User-agent: *
Allow: /

Sitemap: https://yoursite.com/sitemap.xml
```

### 4. Performance Optimization

**Image Optimization:**
- Compress logo with TinyPNG or ImageOptim
- Use WebP format for better compression
- Ensure logo is no larger than necessary

**Minification (Optional):**
For production, you can minify CSS and JS:
```bash
# Using online tools:
# - https://cssminifier.com/
# - https://javascript-minifier.com/

# Or using build tools:
npx minify css/styles.css > css/styles.min.css
npx minify js/main.js > js/main.min.js
```

Then update references in index.html.

### 5. Monitor & Maintain

**Set up monitoring:**
- Google Search Console
- Uptime monitoring (UptimeRobot, Pingdom)
- Form submission notifications
- Analytics review schedule

**Regular updates:**
- Review and respond to form submissions
- Update case studies as new projects complete
- Keep FAQ section current
- Monitor performance metrics

## Troubleshooting

### Logo not showing
- Verify `logo.png` exists in `assets/` folder
- Check browser console for 404 errors
- Ensure file name matches exactly (case-sensitive)

### Form not submitting
- Check browser console for JavaScript errors
- Verify form service configuration
- Test with browser network tab open

### Mobile menu not working
- Clear browser cache
- Check if JavaScript is loading
- Verify no JavaScript errors in console

### Slow loading
- Optimize/compress logo image
- Enable CDN if using traditional hosting
- Consider switching to Netlify/Vercel

## Security Best Practices

1. **Form Protection:**
   - Add rate limiting on backend
   - Implement CAPTCHA for contact form
   - Validate all inputs server-side

2. **HTTPS:**
   - Always use HTTPS (automatic with Netlify/Vercel)
   - Enable HSTS header

3. **Headers:**
   Add security headers via hosting platform or `_headers` file (Netlify):
   ```
   /*
     X-Frame-Options: DENY
     X-Content-Type-Options: nosniff
     X-XSS-Protection: 1; mode=block
     Referrer-Policy: no-referrer-when-downgrade
   ```

## Support

Need help with deployment?
- Check hosting platform documentation
- Review browser console for errors
- Test locally first before deploying
- Ensure all files are uploaded correctly

## Next Steps After Deployment

1. Submit to Google Search Console
2. Set up email notifications for form submissions
3. Create social media cards with OG images
4. Monitor analytics for user behavior
5. A/B test call-to-action buttons
6. Collect feedback and iterate

---

**Recommended Deployment:** Netlify for fastest, easiest deployment with built-in form handling and global CDN.
