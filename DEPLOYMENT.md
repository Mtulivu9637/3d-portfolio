# 🚀 Deployment Guide

## Quick Deployment Options

### 1. GitHub Pages (Recommended)

```bash
# 1. Initialize Git repository (if not already done)
git init
git add .
git commit -m "Initial commit"

# 2. Create GitHub repository and push
git remote add origin https://github.com/Mtulivu9637/3d-portfolio.git
git push -u origin main

# 3. Deploy to GitHub Pages
npm run deploy
```

**GitHub Pages Setup:**
1. Go to your repository settings
2. Scroll to "Pages" section
3. Select "Deploy from a branch"
4. Choose "gh-pages" branch
5. Your site will be available at: `https://Mtulivu9637.github.io/3d-portfolio`

### 2. Netlify

```bash
# Build the project
npm run build

# Option A: Drag and Drop
# 1. Go to https://netlify.com
# 2. Drag the 'dist' folder to the deploy area

# Option B: Git Integration
# 1. Connect your GitHub repository
# 2. Set build command: npm run build
# 3. Set publish directory: dist
```

### 3. Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Or connect GitHub repository at vercel.com
```

### 4. Traditional Web Hosting

```bash
# Build the project
npm run build

# Upload the contents of 'dist' folder via FTP/cPanel
# Make sure to upload to your domain's public_html folder
```

## Environment Variables

Create a `.env` file for production:

```bash
VITE_APP_TITLE="Your 3D Portfolio"
VITE_CONTACT_EMAIL="your.email@domain.com"
VITE_GITHUB_USERNAME="yourusername"
VITE_DEPLOY_URL="https://yourusername.github.io/3d-portfolio"
```

## Domain Configuration

### Custom Domain for GitHub Pages

1. Add `CNAME` file to public folder:
```
yourdomain.com
```

2. Configure DNS:
```
Type: CNAME
Name: www
Value: yourusername.github.io
```

### SSL Certificate

All recommended platforms provide free SSL certificates automatically.

## Performance Optimization for Production

1. **Image Optimization**: Compress images before deployment
2. **Bundle Analysis**: Run `npm run analyze` to check bundle size
3. **CDN**: Use CDN for static assets if needed
4. **Caching**: Configure proper cache headers

## SEO Setup

Update meta tags in `index.html`:

```html
<meta name="description" content="3D Portfolio - iOS Swift, Python/Django, React Developer">
<meta name="keywords" content="iOS Swift, Python Django, React Developer, Portfolio">
<meta property="og:title" content="Your Name - 3D Portfolio">
<meta property="og:description" content="Professional 3D portfolio showcasing iOS, Python, and React projects">
<meta property="og:image" content="https://yourdomain.com/preview.png">
<meta property="og:url" content="https://yourdomain.com">
```

## Analytics Integration

Add Google Analytics (optional):

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Troubleshooting

### Common Issues

1. **White screen on deployment**: Check browser console for errors
2. **Assets not loading**: Verify correct base path configuration
3. **Performance issues**: Enable compression and optimize assets
4. **Mobile issues**: Test on actual devices

### Performance Monitoring

Monitor your deployed site with:
- Google PageSpeed Insights
- GTmetrix
- WebPageTest
- Lighthouse (Chrome DevTools)

## Security Considerations

1. Remove any sensitive information from client-side code
2. Use environment variables for configuration
3. Enable HTTPS (automatic on recommended platforms)
4. Configure proper CORS headers if needed

Your 3D portfolio is now ready for the world! 🌟
