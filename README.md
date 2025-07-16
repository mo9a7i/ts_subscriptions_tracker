# SubTracker - Redirect Branch

This branch contains a simple Jekyll redirect page for GitHub Pages.

## Purpose

- **Main branch**: Contains the full Next.js application deployed on Kubernetes
- **Redirect branch**: Contains Jekyll redirect for GitHub Pages users

## How it works

1. Users visit the old GitHub Pages URL
2. Jekyll automatically redirects them to the new Kubernetes-hosted domain
3. Preserves SEO and user bookmarks

## Configuration

Update the redirect URL in:
- `index.md` - Main redirect
- `404.md` - Fallback redirect

Replace `https://your-new-k8s-domain.com` with your actual domain.

## GitHub Pages Setup

1. Go to Repository Settings > Pages
2. Change source branch from `main` to `redirect`
3. Keep existing custom domain settings

## Local Testing

```bash
bundle install
bundle exec jekyll serve
``` 