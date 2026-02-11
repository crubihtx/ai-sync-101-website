# Quick Start Guide

Get your AI Sync 101 website live in 3 steps.

## Step 1: Add Your Logo (2 minutes)

1. Locate the logo image you shared (the blue-to-pink gradient "A" with orbiting elements)
2. Save it as `logo.png` in the `assets/` folder
3. Recommended size: 400x400px or larger (will be scaled automatically)
4. Format: PNG with transparent background

**That's it!** The website is already configured to use `assets/logo.png`

## Step 2: Choose Form Handling (5 minutes)

Pick one of these options for contact form submissions:

### Option A: Netlify Forms (Easiest - Recommended)
If deploying to Netlify, just add one attribute to the form tag in `index.html`:

Find this line (around line 400):
```html
<form class="contact-form" id="contactForm">
```

Change it to:
```html
<form class="contact-form" id="contactForm" name="contact" method="POST" netlify>
```

Submissions will appear in your Netlify dashboard. Done!

### Option B: Formspree (Works Anywhere)
1. Go to [formspree.io](https://formspree.io)
2. Sign up (free for 50 submissions/month)
3. Create a new form and get your form ID
4. In `index.html`, change the form tag to:
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

### Option C: Custom Backend
Update the fetch URL in `js/main.js` (line 67) to point to your API endpoint.

### Option D: Keep Default (For Testing)
The form currently logs to browser console. Good for local testing.

## Step 3: Deploy (3 minutes)

### Fastest Option: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up or log in
3. **Drag and drop the entire `ai-sync-101-website` folder** onto Netlify
4. Your site is live with HTTPS immediately!
5. Configure custom domain in settings (optional)

**Free tier includes:**
- HTTPS automatically
- Form handling (100 submissions/month)
- Global CDN
- Continuous deployment

### Alternative: Vercel

```bash
cd ai-sync-101-website
npx vercel
```

Follow prompts. Site is live in seconds.

### Alternative: GitHub Pages

```bash
cd ai-sync-101-website
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then enable GitHub Pages in repository settings.

## You're Done!

Your site is now live with:
- ✓ Professional design
- ✓ Mobile-responsive layout
- ✓ Smooth scroll navigation
- ✓ Working contact form
- ✓ HTTPS enabled
- ✓ Fast performance

## Next Steps (Optional)

### Add Analytics (5 minutes)
1. Create Google Analytics 4 property
2. Add tracking code to `<head>` in `index.html`

### Custom Domain (10 minutes)
1. In Netlify: Settings → Domain Management → Add custom domain
2. Update DNS records at your domain registrar
3. HTTPS is automatic

### Customize Content
- All content is in `index.html`
- Edit service descriptions, case studies, FAQ
- Update pricing or timelines
- Add more case studies

## Testing Checklist

Before going live:
- [ ] Logo displays correctly
- [ ] Test form submission
- [ ] Check mobile view (Chrome DevTools)
- [ ] Test all navigation links
- [ ] Verify all sections scroll smoothly
- [ ] Proofread all text content

## Need Help?

- **Setup questions:** Check README.md
- **Deployment help:** See DEPLOYMENT.md
- **Site overview:** Read SITE_OVERVIEW.md
- **Technical issues:** Check browser console for errors

## Common Issues

**Logo not showing?**
- Verify file is named exactly `logo.png`
- Check it's in the `assets/` folder
- Clear browser cache

**Form not submitting?**
- Check Step 2 above
- Verify form service is configured
- Check browser console for errors

**Slow loading?**
- Optimize logo image (compress with TinyPNG)
- Deploy to Netlify/Vercel for CDN

---

**Recommended:** Deploy to Netlify for the easiest, fastest experience with built-in form handling and global CDN.

**Total time to launch:** ~10 minutes
