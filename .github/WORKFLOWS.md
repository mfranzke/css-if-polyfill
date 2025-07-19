# GitHub Actions Workflows Documentation

This document describes all the GitHub Actions workflows and configurations set up for the CSS if() Polyfill project.

## Workflows Overview

### 1. **CI Workflow** (`.github/workflows/ci.yml`)

**Triggers:** Push to main/develop, Pull requests to main/develop

**Jobs:**

- **Test**: Runs on Node.js 22.x, 24.x
    - Checkout repository
    - Install dependencies (with npm cache)
    - Run linting with `xo`
    - Run tests with Vite
    - Upload test coverage to Codecov
- **Build**: Builds package and uploads artifacts
    - Build with `microbundle`
    - Upload `dist/` and `examples/` as artifacts
- **Lint Markdown**: Validates all Markdown files

### 2. **GitHub Pages Deployment** (`.github/workflows/deploy-pages.yml`)

**Triggers:** Push to main, Manual dispatch

**Features:**

- Builds the package
- Creates a comprehensive GitHub Pages site with:
    - All examples from `examples/` folder
    - Built assets from `dist/` folder for CDN usage
    - Auto-generated index page listing all examples
    - Updates example imports to use built polyfill
- Deploys to GitHub Pages with proper permissions

**CDN Access:** `https://cdn.jsdelivr.net/npm/css-if-polyfill/dist/index.modern.js`

### 3. **Release Workflow** (`.github/workflows/release.yml`)

**Triggers:** Git tags starting with `v*`

**Jobs:**

- **Test**: Full test suite before release
- **GitHub Release**: Creates GitHub release with changelog
- **npm Publish**: Publishes to npm registry (requires `NPM_TOKEN` secret)

### 4. **Code Quality** (`.github/workflows/quality.yml`)

**Triggers:** Push to main/develop, Pull requests

**Features:**

- Comprehensive linting with detailed reports
- Test coverage analysis
- Bundle size reporting
- Security vulnerability scanning
- CodeQL security analysis
- Archives coverage reports as artifacts

### 5. **Documentation Updates** (`.github/workflows/docs.yml`)

**Triggers:** Push to main (when src/, examples/, or README.md changes), Manual dispatch

**Features:**

- Auto-generates API documentation
- Updates examples with latest syntax
- Commits changes back to repository
- Skips CI on documentation commits

### 6. **Performance Testing** (`.github/workflows/performance.yml`)

**Triggers:** Push/PR to main (when src/ changes), Manual dispatch

**Features:**

- Runs performance benchmarks using Playwright
- Tests initialization time and processing speed
- Fails if performance thresholds are exceeded
- Comments benchmark results on PRs
- Uploads performance results as artifacts

## Project Templates

### Pull Request Template (`.github/pull_request_template.md`)

Comprehensive PR template including:

- Change type classification
- Testing checklist
- Browser compatibility verification
- Performance impact assessment
- Breaking change documentation

### Issue Templates

#### Bug Report (`.github/ISSUE_TEMPLATE/bug_report.yml`)

- Structured bug reporting form
- CSS example requirements
- Browser compatibility matrix
- Environment details
- Reproduction steps

#### Feature Request (`.github/ISSUE_TEMPLATE/feature_request.yml`)

- Feature impact assessment
- CSS usage examples
- Use case descriptions
- Breaking change analysis

#### Template Configuration (`.github/ISSUE_TEMPLATE/config.yml`)

- Disables blank issues
- Links to discussions, documentation, and security reporting

## Required Secrets

To fully utilize all workflows, set up these GitHub repository secrets:

### Required Secrets

- `CODECOV_TOKEN`: For test coverage reporting
- `NPM_TOKEN`: For publishing to npm (format: `npm_xxxxxxxxxxxx`)

### Optional Secrets

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## GitHub Pages Setup

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The deploy workflow will automatically build and deploy

## Performance Thresholds

Current performance benchmarks:

- **Initialization time**: ≤ 100ms
- **Average processing time**: ≤ 1ms per CSS rule

## Cache Strategy

All workflows use npm caching with `actions/setup-node@v4` to speed up dependency installation.

## Artifact Retention

- **Test coverage**: 30 days
- **Build artifacts**: 30 days
- **Performance results**: 30 days

## Security Features

- **CodeQL Analysis**: Automated security scanning
- **npm audit**: Dependency vulnerability checking
- **Dependabot**: Automated dependency updates
- **Private security reporting**: Configured in issue templates

## Usage Examples

### Triggering Workflows

```bash
# Trigger CI workflow
git push origin main

# Trigger release workflow
git tag v1.0.0
git push origin v1.0.0

# Trigger performance tests
git push origin main  # (if src/ files changed)

# Manual trigger (via GitHub UI)
# Go to Actions → Select workflow → Run workflow
```

### Accessing Build Artifacts

After workflows complete:

1. Go to Actions tab
2. Click on workflow run
3. Download artifacts from the Artifacts section

### Viewing GitHub Pages

After successful deployment:

- Main site: `https://mfranzke.github.io/css-if-polyfill/`
- CDN access: `https://cdn.jsdelivr.net/npm/css-if-polyfill/dist/index.modern.js`

## Maintenance

### Updating Node.js Versions

Edit the `strategy.matrix.node-version` in `ci.yml` to add/remove Node.js versions.

### Updating Performance Thresholds

Modify the threshold checks in `performance.yml`:

```javascript
if (results.initTime > 100) { // Change this value
if (results.avgProcessTime > 1) { // Change this value
```

### Adding New Workflows

Follow the established patterns:

1. Use `actions/checkout@v4` and `actions/setup-node@v4`
2. Include npm caching
3. Add appropriate error handling
4. Upload relevant artifacts
5. Use semantic commit messages
