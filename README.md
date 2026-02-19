# pressroom

Pressroom is a report generation platform built with Next.js 15

## Setup

### Puppeteer (Chrome for PDF generation)

After `pnpm install`, install the Chrome binary that Puppeteer needs:

```bash
pnpm dlx @puppeteer/browsers install chrome@stable
```

By default this installs to `~/.cache/puppeteer`. To specify a custom path (e.g. for Docker):

```bash
export PUPPETEER_CACHE_DIR=/app/.cache/puppeteer
pnpm dlx @puppeteer/browsers install chrome@stable --path $PUPPETEER_CACHE_DIR
```
