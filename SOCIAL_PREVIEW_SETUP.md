# Social Media Preview Setup

## What Was Fixed

The "Link Preview" (also called Rich Link Preview or Open Graph preview) that appears when you share your website via text, email, or social media.

## Changes Made

### **Added Meta Tags:**

1. **Open Graph Tags** (Facebook, iMessage, WhatsApp, Slack)
   - `og:type` - website
   - `og:url` - https://aisync101.com
   - `og:title` - "AI Sync 101 - We Build What You Need, Not What We Sell"
   - `og:description` - "20 years building operational systems..."
   - `og:image` - Social card image (1200x630px)
   - `og:image:width` & `og:image:height` - Proper dimensions

2. **Twitter Card Tags** (Twitter/X)
   - `twitter:card` - summary_large_image
   - `twitter:url` - https://aisync101.com
   - `twitter:title` - Same as OG
   - `twitter:description` - Same as OG
   - `twitter:image` - Social card image

### **Created Social Card Image:**

**File:** `assets/og-image.svg`

**Design:**
- 1200x630px (optimal size for all platforms)
- Dark background (#0A0A0A) with blue-pink gradient
- Clear branding: "AI Sync 101"
- Tagline: "We Build What You Need, Not What We Sell"
- Subtitle: "20 Years Building Operational Systems"
- URL: aisync101.com

## How It Will Look

When someone shares your link via:

### **iMessage / WhatsApp / Text:**
```
┌─────────────────────────────┐
│  AI Sync 101                │
│  We Build What You Need...  │
│                             │
│  [Social Card Image]        │
│                             │
│  aisync101.com              │
└─────────────────────────────┘
```

### **LinkedIn / Facebook:**
Large preview card with image, title, and description

### **Twitter/X:**
Large summary card with featured image

### **Slack / Discord:**
Embedded rich preview with image

## Testing Your Preview

After deploying, test the preview at:

1. **Facebook Debugger:**
   https://developers.facebook.com/tools/debug/
   - Paste: https://aisync101.com
   - Click "Scrape Again" to refresh cache

2. **Twitter Card Validator:**
   https://cards-dev.twitter.com/validator
   - Paste: https://aisync101.com
   - Preview how it looks

3. **LinkedIn Inspector:**
   https://www.linkedin.com/post-inspector/
   - Paste: https://aisync101.com
   - Clear cache if needed

4. **Test via iMessage:**
   - Text yourself the link: https://aisync101.com
   - Preview should appear automatically

## Important Notes

### **Cache Issues:**
- Social platforms cache previews for 7-30 days
- After deploying, you MUST use the debugger tools above to refresh cache
- Otherwise old previews will show for weeks

### **Image Requirements:**
- **Minimum:** 200x200px
- **Recommended:** 1200x630px (we use this)
- **Maximum:** 8MB file size
- **Formats:** JPG, PNG, SVG (we use SVG - scalable)

### **What Shows Where:**

| Platform | Uses | Card Type |
|----------|------|-----------|
| iMessage | OG tags | Small preview |
| WhatsApp | OG tags | Small preview |
| Facebook | OG tags | Large card |
| LinkedIn | OG tags | Large card |
| Twitter/X | Twitter tags | Summary large |
| Slack | OG tags | Embedded |
| Discord | OG tags | Embedded |
| Email clients | Varies | Some show, some don't |

## Customization

### **Change the Title:**
Edit both:
```html
<meta property="og:title" content="YOUR TITLE">
<meta property="twitter:title" content="YOUR TITLE">
```

### **Change the Description:**
Edit both:
```html
<meta property="og:description" content="YOUR DESCRIPTION">
<meta property="twitter:description" content="YOUR DESCRIPTION">
```

### **Change the Image:**
1. Create new image (1200x630px)
2. Save to `assets/` folder
3. Update both:
```html
<meta property="og:image" content="https://aisync101.com/assets/YOUR-IMAGE.png">
<meta property="twitter:image" content="https://aisync101.com/assets/YOUR-IMAGE.png">
```

## Best Practices

✅ **Do:**
- Keep title under 60 characters
- Keep description under 200 characters
- Use high-quality images (1200x630px)
- Test on all platforms after deployment
- Refresh cache after changes

❌ **Don't:**
- Use images smaller than 200x200px
- Forget to test after deploying
- Use copyrighted images
- Make text too small on images
- Forget to clear platform caches

## Current Settings

**Title:** "AI Sync 101 - We Build What You Need, Not What We Sell"
**Description:** "20 years building operational systems. Custom platforms and intelligent automation that solve your most expensive business challenges."
**Image:** `assets/og-image.svg` (1200x630px)
**URL:** https://aisync101.com

All major platforms supported! 🎉
