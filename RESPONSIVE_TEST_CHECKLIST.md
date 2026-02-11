# Responsive Design Test Checklist

## Problems Section - Breakpoints

### Desktop (1024px+)
- ✅ 3-column grid layout
- ✅ Cards side-by-side
- ✅ Problem images: 280px max width
- ✅ Full spacing (--spacing-lg, --spacing-xl)
- ✅ Problem title: 1.5rem
- ✅ CTA text: 1.5rem

### Tablet (768px - 1024px)
- ✅ Single column layout (stacked cards)
- ✅ Cards full width
- ✅ Reduced padding on cards
- ✅ Problem title: 1.25rem
- ✅ CTA text: 1.25rem
- ✅ Touch-friendly spacing

### Mobile (480px - 768px)
- ✅ Single column layout
- ✅ Compact spacing (--spacing-md)
- ✅ Smaller padding on cards
- ✅ Problem title: 1.25rem
- ✅ Responsive images scale down

### Small Mobile (<480px)
- ✅ Minimal spacing (--spacing-sm)
- ✅ Problem title: 1.125rem
- ✅ Problem list: 0.9rem font
- ✅ CTA text: 1.125rem
- ✅ Problem images: 240px max width
- ✅ Reduced padding everywhere
- ✅ Grid uses min(100%, 320px) for flexibility

## Touch Targets
- ✅ CTA buttons: minimum 48x48px
- ✅ Card hover effects work on mobile
- ✅ Links are easy to tap

## Performance
- ✅ SVG images (lightweight)
- ✅ CSS animations optimized
- ✅ No layout shifts
- ✅ Fast rendering

## Cross-Browser
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## Testing URLs
- Desktop: Full width browser
- Tablet: Browser at 768px width
- Mobile: Browser at 375px width
- Small: Browser at 320px width

## Manual Test Steps
1. Open site in browser
2. Open DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
4. Test these breakpoints:
   - 1440px (Desktop)
   - 1024px (Tablet landscape)
   - 768px (Tablet portrait)
   - 375px (iPhone)
   - 320px (Small mobile)
5. Verify:
   - No horizontal scroll
   - Cards stack properly
   - Text is readable
   - Images scale correctly
   - Buttons are tappable
   - Spacing looks good

## Hero Tagline - Responsive Breakpoints

### Desktop (1024px+)
- ✅ Font size: clamp(0.75rem, 2vw, 1.125rem) - scales fluidly
- ✅ Letter spacing: 0.15em for emphasis
- ✅ Padding: 0.75rem 1.5rem
- ✅ Blue glow pulse animation
- ✅ Centered inline badge
- ✅ Text wraps if needed (word-wrap: break-word)

### Tablet (768px - 1024px)
- ✅ Font size: 0.875rem
- ✅ Letter spacing: 0.08em (reduced to prevent overflow)
- ✅ Padding: 0.625rem 1rem (compact)
- ✅ Margin: reduced spacing
- ✅ Badge remains readable

### Mobile (480px - 768px)
- ✅ Font size: 0.7rem (very compact)
- ✅ Letter spacing: 0.05em (minimal to prevent wrap)
- ✅ Padding: 0.5rem 0.75rem (tight)
- ✅ Text stays on one line or breaks gracefully
- ✅ Blue glow still visible but subtle

### Test Points for Hero Tagline:
1. No horizontal scroll at any width
2. Text doesn't overflow the badge
3. Badge doesn't break layout
4. Pulse animation performs well on mobile
5. Text remains readable at all sizes
6. Letter spacing doesn't cause text to wrap awkwardly
7. Badge centers properly in hero section

### Critical Widths to Test:
- 320px (iPhone SE) - Smallest common mobile
- 375px (iPhone standard) - Most common mobile
- 768px (iPad portrait) - Tablet
- 1024px (iPad landscape) - Large tablet
- 1440px (Desktop) - Standard desktop
