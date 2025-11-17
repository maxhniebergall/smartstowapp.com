# SmartStow Blog Guide

Complete guide for adding and managing blog posts on smartstowapp.com

## Table of Contents
1. [Quick Start: Adding a New Blog Post](#quick-start-adding-a-new-blog-post)
2. [Blog Post Template Guide](#blog-post-template-guide)
3. [SEO Checklist](#seo-checklist)
4. [Image Optimization](#image-optimization)
5. [CTA Placement Best Practices](#cta-placement-best-practices)
6. [Updating the Blog Index](#updating-the-blog-index)
7. [Sitemap & RSS Updates](#sitemap--rss-updates)
8. [Internal Linking Strategy](#internal-linking-strategy)
9. [Email Capture Integration](#email-capture-integration)

---

## Quick Start: Adding a New Blog Post

### Step-by-Step Process (Est. 10-15 minutes per post)

1. **Copy the template**
   ```bash
   cp blog/blog-post-template.html blog/your-post-slug.html
   ```

2. **Prepare your hero image** (1200x630px WebP):
   - Save to `blog-assets/images/your-post-slug-hero.webp`

3. **Edit the new HTML file** and replace all `[REPLACE: ...]` placeholders:
   - Meta tags (title, description, keywords)
   - Open Graph tags
   - Schema markup
   - Post title (H1)
   - Publication date
   - Content sections
   - Images
   - CTAs

4. **Add a post card to `/blog/index.html`** (see section below)

5. **Update `sitemap.xml`** with new post URL

6. **Test locally** before committing

7. **Commit and push** to deploy via GitHub Pages

---

## Blog Post Template Guide

### Essential Replacements

The template has `[REPLACE: ...]` markers throughout. Here's what to customize:

#### 1. SEO Meta Tags (Lines 6-36)
```html
<!-- Replace these -->
<meta name="description" content="[REPLACE: 150-160 character description]">
<title>[REPLACE: Your Post Title] | SmartStow Blog</title>
<link rel="canonical" href="https://smartstowapp.com/blog/[REPLACE-WITH-POST-SLUG]/">
```

**Best Practices:**
- **Title**: 50-60 characters, include primary keyword
- **Description**: 150-160 characters, compelling summary
- **URL Slug**: lowercase, hyphens, no special characters
  - Good: `/blog/ultimate-moving-checklist/`
  - Bad: `/blog/Ultimate_Moving_Checklist!!/`

#### 2. Open Graph Tags (Lines 38-48)
```html
<meta property="og:title" content="[REPLACE: Your Post Title]">
<meta property="og:description" content="[REPLACE: Same as meta description]">
<meta property="og:image" content="https://smartstowapp.com/blog-assets/images/[REPLACE-hero-image.webp]">
<meta property="og:article:published_time" content="[REPLACE: 2025-11-20T08:00:00Z]">
<meta property="og:article:modified_time" content="[REPLACE: 2025-11-20T08:00:00Z]">
```

**Date Format**: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)

#### 3. JSON-LD Schema Markup (Lines 61-83)
```json
{
  "headline": "[REPLACE: Your Post Title - Keep under 110 characters]",
  "description": "[REPLACE: Same as meta description]",
  "image": {
    "url": "https://smartstowapp.com/blog-assets/images/[REPLACE-hero-image.webp]"
  },
  "datePublished": "[REPLACE: 2025-11-20T08:00:00Z]",
  "wordCount": "[REPLACE: Actual word count]",
  "articleSection": "[REPLACE: Category like 'Moving Guides' or 'Organization Tips']",
  "keywords": ["[REPLACE: keyword1]", "[REPLACE: keyword2]", "[REPLACE: keyword3]"]
}
```

**Why This Matters**: Powers rich snippets in Google search results.

#### 4. Content Structure

**Header Section**:
```html
<div class="blog-breadcrumb">
    <a href="/blog/">Blog</a> <span>/</span> <span class="blog-category-link">[REPLACE: Category]</span>
</div>

<h1 class="blog-post-title">[REPLACE: Your Compelling Blog Post Title Here]</h1>

<div class="blog-post-meta">
    <span class="blog-post-date">[REPLACE: November 20, 2025]</span>
    <span class="blog-post-read-time">[REPLACE: 8] min read</span>
</div>
```

**Calculate Read Time**: Word count ÷ 200 = minutes (round up)

---

## SEO Checklist

Before publishing any blog post, verify:

### Meta Tags ✓
- [ ] Title tag is 50-60 characters
- [ ] Meta description is 150-160 characters
- [ ] Canonical URL is correct
- [ ] Keywords meta tag includes 4-6 relevant terms

### Open Graph ✓
- [ ] og:title set
- [ ] og:description set
- [ ] og:image points to correct hero image (1200x630px)
- [ ] og:url matches canonical URL
- [ ] Published/modified times are correct

### Schema Markup ✓
- [ ] BlogPosting schema is complete
- [ ] Headline is under 110 characters
- [ ] Word count is accurate
- [ ] Article section/category is set
- [ ] Keywords array populated

### Content SEO ✓
- [ ] H1 (post title) includes primary keyword naturally
- [ ] H2 headings are descriptive and include keywords
- [ ] First paragraph includes primary keyword
- [ ] Images have descriptive alt text
- [ ] Internal links to related posts/pages
- [ ] External links open in new tab (if applicable)

### Technical ✓
- [ ] Hero image is WebP format, 1200x630px
- [ ] All images have `loading="lazy"` (except hero)
- [ ] Hero image has `loading="eager"`
- [ ] Mobile responsive (test on small screen)
- [ ] Forms point to correct backend API endpoint

---

## Image Optimization

### Required Image Sizes

1. **Hero Image** (required for every post):
   - **Dimensions**: 1200x630px
   - **Format**: WebP
   - **Quality**: 80-85%
   - **Naming**: `your-post-slug-hero.webp`
   - **Location**: `/blog-assets/images/`
   - **Why**: Optimized for Open Graph social sharing

2. **Blog Card Thumbnail**:
   - **Dimensions**: 600x400px (or use cropped hero at this size)
   - **Format**: WebP
   - **Same hero image works**: Just ensure it looks good cropped

3. **In-Content Images**:
   - **Max width**: 800px
   - **Format**: WebP
   - **Quality**: 75-80%
   - **Naming**: `your-post-slug-content-1.webp`, etc.

### Converting to WebP

**Using ImageMagick (command line)**:
```bash
# Install ImageMagick if needed
brew install imagemagick

# Convert single image
magick convert input.jpg -quality 80 -resize 1200x630 output.webp

# Batch convert all JPGs in directory
for img in *.jpg; do magick convert "$img" -quality 80 "${img%.jpg}.webp"; done
```

**Using Online Tool**:
- [Squoosh.app](https://squoosh.app/) - Free, browser-based
- Drag & drop, adjust quality, download

### Alt Text Best Practices

**Good Alt Text**:
```html
<img src="../blog-assets/images/moving-checklist-hero.webp"
     alt="Woman checking off items on a printable moving checklist while packing boxes">
```

**Bad Alt Text**:
```html
<img src="../blog-assets/images/hero.webp" alt="image">
```

**Rules**:
- Be descriptive (10-15 words)
- Include relevant keywords naturally
- Describe what's actually in the image
- Don't start with "Image of..." (screen readers already say "image")

---

## CTA Placement Best Practices

### The 3-CTA Strategy

Based on conversion research, every blog post should have **3-5 CTAs**:

1. **CTA #1: Early Engagement** (after intro, ~10% through post)
   - Purpose: Capture high-intent readers
   - Type: Lead magnet (PDF download) OR soft app pitch
   - Example: "Download the Free Checklist"

2. **CTA #2: Mid-Post Conversion** (40-50% through post)
   - Purpose: Convert readers who are engaged
   - Type: App trial signup
   - Example: "Never Lose Track of Your Items Again → Try SmartStow Free"

3. **CTA #3: Final Strong CTA** (end of post)
   - Purpose: Convert readers who read the full post
   - Type: Primary conversion (app download)
   - Strongest pitch
   - Example: Multiple buttons + trust signals

### CTA Templates in Template File

The template includes ready-to-use CTA blocks:

#### Lead Magnet CTA (Optional)
```html
<div class="blog-cta blog-cta-lead-magnet" data-cta-position="top">
    <div class="cta-icon">📋</div>
    <h3>[REPLACE: Get the FREE Printable Checklist]</h3>
    <p>[REPLACE: Brief description]</p>
    <form class="lead-magnet-form" action="[YOUR-API]" method="POST">
        <input type="email" name="email" placeholder="Enter your email" required>
        <input type="hidden" name="source" value="[post-slug]">
        <button type="submit" class="btn btn-primary">Download Free PDF</button>
    </form>
    <p class="trust-signal">Join thousands of organized movers. No spam, ever.</p>
</div>
```

#### Mid-Post App CTA
```html
<div class="blog-cta blog-cta-app" data-cta-position="mid">
    <h3>Never Lose Track of Your Items Again</h3>
    <p>SmartStow uses voice recording to help you organize everything hands-free.</p>
    <a href="../#download" class="btn btn-primary">Try SmartStow Free →</a>
    <p class="cta-subtext">30-day free trial • No credit card required</p>
</div>
```

#### End-of-Post Strong CTA
```html
<div class="blog-cta blog-cta-final" data-cta-position="bottom">
    <h2>Ready to Organize Your Life?</h2>
    <p>Start using SmartStow today and experience the easiest way to track belongings.</p>
    <div class="cta-buttons">
        <a href="../#download" class="btn btn-primary">Start Free Trial</a>
        <a href="../#features" class="btn btn-secondary">See How It Works</a>
    </div>
    <p class="trust-signal">✓ 30-day free trial &nbsp; ✓ No credit card required &nbsp; ✓ Available on Android</p>
</div>
```

### CTA Copy Guidelines

**Weak CTA Copy** (avoid):
- "Learn More"
- "Click Here"
- "Download App"

**Strong CTA Copy** (use):
- "Start Your Free Trial →"
- "Get the Printable Checklist"
- "Try Voice Recording Free"
- "Organize Your Move Today"

**Why**: Action-oriented, benefit-focused, specific.

---

## Updating the Blog Index

When you add a new blog post, update `/blog/index.html`:

### 1. Remove Empty State (First Post Only)

On your **first blog post**, delete the empty state section:

```html
<!-- DELETE THIS ENTIRE SECTION after adding your first post -->
<div class="blog-empty-state">
    <div class="empty-state-icon">📝</div>
    <h2>Coming Soon</h2>
    ...
</div>
```

### 2. Uncomment Blog Grid

Uncomment the blog grid wrapper:

```html
<!-- Change this: -->
<!--
<div class="blog-grid">
-->

<!-- To this: -->
<div class="blog-grid">
```

### 3. Add Post Card

Copy this template and add it to the `.blog-grid` div:

```html
<article class="blog-card">
    <a href="/blog/your-post-slug/" class="blog-card-link">
        <div class="blog-card-image">
            <img src="../blog-assets/images/your-post-slug-hero.webp"
                 alt="Descriptive alt text"
                 loading="lazy">
        </div>
        <div class="blog-card-content">
            <span class="blog-category">Category Name</span>
            <h2 class="blog-card-title">Your Post Title Here</h2>
            <p class="blog-card-excerpt">A brief 1-2 sentence description that entices readers to click.</p>
            <div class="blog-card-meta">
                <span class="blog-date">Nov 20, 2025</span>
                <span class="blog-read-time">8 min read</span>
            </div>
        </div>
    </a>
</article>
```

### 4. Order Posts

**Newest posts first**: Add new post cards at the **top** of the `.blog-grid` div.

```html
<div class="blog-grid">
    <!-- Newest post (Nov 25) -->
    <article class="blog-card">...</article>

    <!-- Older post (Nov 20) -->
    <article class="blog-card">...</article>

    <!-- Oldest post (Nov 15) -->
    <article class="blog-card">...</article>
</div>
```

---

## Sitemap & RSS Updates

### Updating sitemap.xml

Every time you add a blog post, update `sitemap.xml`:

```xml
<!-- Add this block for each new post -->
<url>
    <loc>https://smartstowapp.com/blog/your-post-slug/</loc>
    <lastmod>2025-11-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
</url>
```

**Priority Guidelines**:
- Blog index: `0.8`
- Regular blog posts: `0.7`
- Comparison posts (money pages): `0.9`
- Homepage: `1.0`

**After Updating**:
1. Commit and push changes
2. Submit to Google Search Console:
   - Go to Search Console → Sitemaps
   - Add/resubmit: `https://smartstowapp.com/sitemap.xml`

### Updating feed.xml (RSS)

If you create an RSS feed (optional), add each post to `/blog/feed.xml`:

```xml
<item>
    <title>Your Post Title</title>
    <description>Post description/excerpt</description>
    <link>https://smartstowapp.com/blog/your-post-slug/</link>
    <guid>https://smartstowapp.com/blog/your-post-slug/</guid>
    <pubDate>Wed, 20 Nov 2025 08:00:00 GMT</pubDate>
</item>
```

**pubDate Format**: RFC 822 (Day, DD Mon YYYY HH:MM:SS GMT)

---

## Internal Linking Strategy

### Hub-and-Spoke Model

Create a content ecosystem where posts link to each other:

```
Homepage
    ↓
Blog Index
    ↓
├── Post 1 (Moving Checklist)
│   ├── Links to Post 3 (Comparison)
│   └── Links to homepage #download
├── Post 2 (TikTok Hacks)
│   ├── Links to Post 1 (Checklist)
│   └── Links to Post 3 (Comparison)
└── Post 3 (SmartStow vs Sortly) ← MONEY PAGE
    └── Multiple CTAs to app download
```

### Where to Add Internal Links

1. **In blog post content** (3-5 links per post):
   ```html
   <p>For a complete timeline, check out our
   <a href="/blog/ultimate-moving-checklist/">Ultimate Moving Checklist</a>.</p>
   ```

2. **Related Posts section** (at end of post):
   - Template already has this section
   - Uncomment and fill in related post cards

3. **From homepage to blog**:
   - Add link in Features section
   - Add link in About section
   - Example: "Moving soon? Read our expert tips on the SmartStow Blog."

### Anchor Text Best Practices

**Good Anchor Text**:
- "ultimate moving checklist"
- "comparison of inventory apps"
- "our guide to organization hacks"

**Bad Anchor Text**:
- "click here"
- "this post"
- "read more"

**Why**: Descriptive anchor text helps SEO and user experience.

---

## Email Capture Integration

### Connecting to Your Backend API

The lead magnet form template has this structure:

```html
<form class="lead-magnet-form" action="[REPLACE-WITH-YOUR-BACKEND-API]" method="POST">
    <input type="email" name="email" placeholder="Enter your email" required>
    <input type="hidden" name="source" value="[REPLACE-post-slug]">
    <button type="submit" class="btn btn-primary">Download Free PDF</button>
</form>
```

### Setup Steps

1. **Create API endpoint** on your backend (e.g., `/api/lead-magnet`)
   - Accept POST with `email` and `source` fields
   - Validate email format
   - Store in database
   - Send automated email with PDF link

2. **Replace form action**:
   ```html
   <form class="lead-magnet-form"
         action="https://api.smartstowapp.com/api/lead-magnet"
         method="POST">
   ```

3. **Customize source tracking**:
   ```html
   <input type="hidden" name="source" value="moving-checklist-blog">
   ```
   This helps you track which post generates the most leads.

### Email Auto-Responder Template

When someone submits the form, send them an email like this:

```
Subject: Here's Your Free Moving Checklist!

Hi there!

Thanks for downloading the SmartStow Moving Checklist.

Download your printable PDF here:
[Link to PDF]

While you're organizing your move, have you tried SmartStow?
It's the easiest way to track where everything is stored using voice recording.

Start your free trial: [Link to app]

Happy organizing!
The SmartStow Team
```

### PDF Hosting

PDFs should be saved in `/blog-assets/downloads/`:

```
/blog-assets/downloads/
├── moving-checklist.pdf
├── organization-guide.pdf
└── comparison-chart.pdf
```

**Direct link example**:
```
https://smartstowapp.com/blog-assets/downloads/moving-checklist.pdf
```

---

## Advanced Tips

### 1. Calculating Word Count

```bash
# In your blog post HTML file:
# Strip HTML tags and count words
sed 's/<[^>]*>//g' blog/your-post.html | wc -w
```

Use this number in your schema markup `wordCount` field.

### 2. Testing Blog Posts Locally

```bash
# Python
python3 -m http.server 8000

# Node
npx http-server

# Then visit:
# http://localhost:8000/blog/
# http://localhost:8000/blog/your-post-slug.html
```

### 3. Schema Markup Validation

After publishing, test your schema markup:
- Go to: https://validator.schema.org/
- Enter your blog post URL
- Fix any errors shown

### 4. Mobile Testing

Test every post on mobile:
- Chrome DevTools: Right-click → Inspect → Toggle device toolbar
- Test on iPhone SE (small), iPhone 12 Pro (medium), iPad (tablet)
- Verify images load, CTAs are clickable, text is readable

### 5. Performance Check

Run each post through Google PageSpeed Insights:
- https://pagespeed.web.dev/
- Target: 90+ score on mobile
- Fix any image optimization issues
- Ensure Core Web Vitals are green

---

## Troubleshooting

### Blog index not showing new post
- Did you uncomment the `<div class="blog-grid">` wrapper?
- Did you remove the empty state section?
- Clear browser cache (Cmd+Shift+R)

### Images not loading
- Verify file path: `/blog-assets/images/your-file.webp`
- Check file exists in the repo
- Verify image file extension matches HTML (case-sensitive)

### Styles look broken
- Verify `/styles.css` is linked correctly: `<link rel="stylesheet" href="../styles.css">`
- From blog post pages, use `../styles.css` (one level up)
- From blog index, use `../styles.css` (one level up)

### Forms not submitting
- Verify backend API endpoint is live
- Check browser console for CORS errors
- Test API endpoint with curl:
  ```bash
  curl -X POST https://api.smartstowapp.com/api/lead-magnet \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","source":"test"}'
  ```

---

## Quick Reference: File Locations

```
smartstowapp.com/
├── blog/
│   ├── index.html                    # Blog listing page
│   ├── blog-post-template.html       # Copy this for new posts
│   └── your-new-post.html            # Your actual posts
├── blog-assets/
│   ├── images/
│   │   ├── your-post-hero.webp      # 1200x630px
│   │   └── your-post-content-1.webp # In-content images
│   └── downloads/
│       └── your-lead-magnet.pdf     # Lead magnets
├── styles.css                        # Includes blog styles
├── sitemap.xml                       # Update for each post
├── BLOG-GUIDE.md                     # This guide!
└── index.html                        # Main site (add blog link)
```

---

## Support

If you have questions about this guide:
- Review the template file comments
- Check existing blog posts for examples
- Test changes locally before deploying

Happy blogging! 🚀
