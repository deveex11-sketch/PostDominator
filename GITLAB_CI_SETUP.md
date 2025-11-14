# GitLab CI/CD Setup Guide

This guide explains how to set up and use the GitLab CI/CD pipeline for Post Dominator.

## Overview

The `.gitlab-ci.yml` file defines a complete CI/CD pipeline with the following stages:

1. **Validate** - Linting, formatting, and type checking
2. **Build** - Building the Next.js application
3. **Deploy** - Deploying to staging and production environments

## Pipeline Stages

### 1. Validation Stage

#### `install_dependencies`
- Installs npm dependencies
- Caches `node_modules` for faster subsequent builds
- Runs when package files change or on merge requests

#### `lint`
- Runs ESLint to check code quality
- Fails the pipeline if linting errors are found
- Runs on merge requests and main branches

#### `format_check`
- Checks code formatting with Prettier
- Ensures consistent code style
- Runs on merge requests and main branches

#### `type_check`
- Runs TypeScript compiler to check for type errors
- Catches type issues before deployment
- Runs on merge requests and main branches

### 2. Build Stage

#### `build`
- Builds the Next.js application for production
- Creates optimized production bundle
- Artifacts are stored for deployment
- Runs on merge requests, main branches, and tags

### 3. Deploy Stage

#### `deploy_staging`
- Deploys to staging environment
- Manual deployment (requires approval)
- Runs on `develop` branch
- **Note**: Update the deployment script with your actual deployment commands

#### `deploy_production`
- Deploys to production environment
- Manual deployment (requires approval)
- Runs on `main` branch and tags
- **Note**: Update the deployment script with your actual deployment commands

## Setup Instructions

### 1. Configure GitLab CI/CD Variables

Go to your GitLab project → Settings → CI/CD → Variables and add:

#### Required Variables (if using Docker)
- `CI_REGISTRY_USER` - GitLab registry username
- `CI_REGISTRY_PASSWORD` - GitLab registry password
- `CI_REGISTRY` - GitLab container registry URL (usually `registry.gitlab.com`)

#### Optional Environment Variables
- `NEXT_PUBLIC_APP_URL` - Your application URL
- `DATABASE_URL` - Database connection string
- `FACEBOOK_APP_ID` - Facebook OAuth credentials
- `FACEBOOK_APP_SECRET` - Facebook OAuth credentials
- `TWITTER_CLIENT_ID` - Twitter OAuth credentials
- `TWITTER_CLIENT_SECRET` - Twitter OAuth credentials
- (Add other OAuth credentials as needed)

**Important**: Mark sensitive variables as "Protected" and "Masked" for security.

### 2. Update Deployment Scripts

Edit `.gitlab-ci.yml` and update the deployment scripts in:
- `deploy_staging` job
- `deploy_production` job

#### Example Deployment Options:

**Option A: Direct Deployment (PM2, systemd, etc.)**
```yaml
script:
  - npm run build
  - pm2 restart post-dominator
```

**Option B: Docker Deployment**
```yaml
script:
  - docker build -t post-dominator:$CI_COMMIT_REF_SLUG .
  - docker push registry.gitlab.com/your-group/post-dominator:$CI_COMMIT_REF_SLUG
  - ssh user@server "docker pull registry.gitlab.com/your-group/post-dominator:$CI_COMMIT_REF_SLUG && docker-compose up -d"
```

**Option C: Kubernetes Deployment**
```yaml
script:
  - kubectl set image deployment/post-dominator app=registry.gitlab.com/your-group/post-dominator:$CI_COMMIT_REF_SLUG -n production
```

**Option D: Vercel/Netlify Deployment**
```yaml
script:
  - npm install -g vercel
  - vercel --prod --token $VERCEL_TOKEN
```

### 3. Configure Branch Protection

1. Go to Settings → Repository → Protected Branches
2. Protect `main` and `develop` branches
3. Require merge requests and approvals

### 4. Set Up Environments

1. Go to Operations → Environments
2. Create `staging` and `production` environments
3. Configure environment-specific variables if needed

## Docker Support

A `Dockerfile` is included for containerized deployments. To use it:

1. Enable Docker build job in `.gitlab-ci.yml` (uncomment `docker_build`)
2. Configure GitLab Container Registry
3. Update deployment scripts to use Docker images

### Building Docker Image Locally

```bash
# Build the image
docker build -t post-dominator:latest .

# Run the container
docker run -p 3000:3000 post-dominator:latest
```

### Using Standalone Output

The Next.js config is set to use `standalone` output when `DOCKER_BUILD=true`. This creates a minimal production build.

## Pipeline Triggers

The pipeline runs automatically on:
- **Push to `main` or `develop`** - Full pipeline
- **Merge Requests** - Validation and build stages
- **Tags** - Full pipeline including production deployment
- **Manual triggers** - Can be triggered manually from GitLab UI

## Customization

### Adding Tests

If you add tests later, add a test job:

```yaml
test:
  stage: validate
  dependencies:
    - install_dependencies
  script:
    - npm test
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

### Adding Security Scanning

GitLab provides built-in security scanning. Enable it in:
Settings → CI/CD → Security and Compliance → Security scanning

### Performance Testing

The `lighthouse` job is included but disabled by default. To enable:
1. Install Lighthouse CI: `npm install -g @lhci/cli`
2. Create `lighthouserc.js` configuration
3. Set `when: on_success` instead of `when: manual`

## Troubleshooting

### Pipeline Fails on Lint

- Fix linting errors locally: `npm run lint`
- Some errors can be auto-fixed: `npm run lint -- --fix`

### Pipeline Fails on Format Check

- Fix formatting: `npm run format`
- Check what would change: `npm run format:check`

### Build Fails

- Check Node.js version compatibility
- Ensure all environment variables are set
- Check build logs for specific errors

### Deployment Fails

- Verify deployment scripts are correct
- Check server access and permissions
- Ensure environment variables are set in GitLab CI/CD settings

## Best Practices

1. **Always test locally first**: Run `npm run lint`, `npm run format:check`, and `npm run build` before pushing
2. **Use feature branches**: Create branches for features and use merge requests
3. **Review before merging**: Require code reviews for `main` branch
4. **Monitor deployments**: Check application health after deployment
5. **Keep secrets secure**: Never commit secrets to the repository
6. **Use environment-specific configs**: Different settings for staging vs production

## Additional Resources

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Docker Documentation](https://docs.docker.com/)

---

**Need Help?** Check the GitLab CI/CD logs for detailed error messages and stack traces.

