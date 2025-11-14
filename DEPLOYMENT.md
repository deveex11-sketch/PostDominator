# Deployment Guide

This guide explains how to deploy Post Dominator using GitLab CI/CD.

## GitLab CI/CD Variables

Configure these variables in GitLab: **Settings → CI/CD → Variables**

### Required Variables

```bash
# Production URL
PRODUCTION_URL=https://yourdomain.com

# Staging URL (optional)
STAGING_URL=https://staging.yourdomain.com

# Deployment Script (customize based on your deployment target)
DEPLOY_SCRIPT=npm run build && npm run start
```

### OAuth Environment Variables

Add all OAuth credentials as protected/masked variables:

```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ENCRYPTION_KEY=<your_encryption_key>
FACEBOOK_APP_ID=<your_facebook_app_id>
FACEBOOK_APP_SECRET=<your_facebook_app_secret>
TWITTER_CLIENT_ID=<your_twitter_client_id>
TWITTER_CLIENT_SECRET=<your_twitter_client_secret>
REDDIT_CLIENT_ID=<your_reddit_client_id>
REDDIT_CLIENT_SECRET=<your_reddit_client_secret>
REDDIT_USER_AGENT=PostDominator/1.0 by YourUsername
LINKEDIN_CLIENT_ID=<your_linkedin_client_id>
LINKEDIN_CLIENT_SECRET=<your_linkedin_client_secret>
# ... etc for other platforms
```

**Important:** 
- Mark sensitive variables as **Protected** and **Masked**
- Set `NEXT_PUBLIC_APP_URL` to your production URL

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

1. Install Vercel CLI: `npm install -g vercel`
2. Get your Vercel token from: https://vercel.com/account/tokens
3. Add GitLab variable: `VERCEL_TOKEN` (protected, masked)
4. Update `.gitlab-ci.yml` deploy script:

```yaml
deploy:production:
  script:
    - npm install -g vercel
    - vercel --prod --token=$VERCEL_TOKEN --yes
```

### Option 2: Self-Hosted Server (SSH)

1. Generate SSH key pair for deployment
2. Add public key to server: `~/.ssh/authorized_keys`
3. Add GitLab variables:
   - `SSH_PRIVATE_KEY` (protected, masked) - Your private SSH key
   - `DEPLOY_SERVER` - Your server IP/domain
   - `DEPLOY_USER` - SSH username
4. Update `.gitlab-ci.yml` deploy script (see `.gitlab-ci.example.yml`)

### Option 3: Docker

1. Set up Docker registry (Docker Hub, GitLab Container Registry, etc.)
2. Add GitLab variables:
   - `DOCKER_REGISTRY` - Your registry URL
   - `CI_REGISTRY_USER` - Registry username
   - `CI_REGISTRY_PASSWORD` - Registry password
3. Uncomment Docker build job in `.gitlab-ci.yml`
4. Create `Dockerfile` in project root

### Option 4: Kubernetes

1. Set up Kubernetes cluster
2. Configure kubectl in GitLab runner
3. Add GitLab variables:
   - `KUBECONFIG` - Your kubeconfig file content
4. Update deploy script for kubectl commands

## Dockerfile Example

If using Docker, create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

Also update `next.config.mjs`:

```javascript
const nextConfig = {
  output: 'standalone',
  // ... rest of config
}
```

## Testing the Pipeline

1. Push to `develop` branch → Triggers build and test stages
2. Push to `main` branch → Triggers all stages
3. Manual deployment → Click "Play" button in GitLab CI/CD pipeline

## Troubleshooting

### Build fails
- Check Node.js version matches (currently 20)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Deployment fails
- Verify all environment variables are set
- Check deployment script syntax
- Ensure server/registry credentials are correct

### OAuth not working in production
- Verify `NEXT_PUBLIC_APP_URL` matches production URL
- Check OAuth redirect URIs in platform developer portals
- Ensure all OAuth environment variables are set

## Security Best Practices

1. ✅ Never commit `.env.local` or `.env` files
2. ✅ Mark sensitive variables as Protected and Masked
3. ✅ Use different OAuth apps for staging/production
4. ✅ Rotate encryption keys periodically
5. ✅ Use HTTPS only in production
6. ✅ Set up branch protection rules
7. ✅ Enable deployment approvals for production

