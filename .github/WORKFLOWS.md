# GitHub Actions Workflows Documentation

This document describes all the GitHub Actions workflows and configurations set up for the CSS if() Polyfill project.

## Workflows Overview

### 1. **Default CI/CD Pipeline** (`.github/workflows/default.yml`)

**Triggers:** Push to main, Pull requests to main, Manual dispatch

**Optimized Parallel Architecture:**

This is the main orchestrator workflow that runs analysis tasks in parallel, then proceeds with build-dependent tasks sequentially:

**Stage 1: Parallel Analysis** (All run simultaneously, no build required)

- **Lint & Code Style** - XO linting, Markdown linting, Package checks by publint, Prettier checks, Spell checking with codespell
- **Quality Analysis** - Test coverage, quality metrics (embedded quality checks)
- **Security Analysis** - CodeQL security scanning (calls `codeql.yml`)
- **Audit Fix for Dependabot** - Automatically suggests `npm audit fix` for Dependabot PRs (calls `audit-fix-pr.yml`, conditional)

**Stage 2: Build & Test** (Requires all Stage 1 to pass)

- **CI Tests & Build** - Calls `ci.yml` for comprehensive testing and building

**Stage 3: Performance Testing** (Conditional, requires build)

- **Performance Tests** - Calls `performance.yml` (only when src/ files change)

**Stage 4: Deploy** (Requires all previous stages, main branch only)

- **GitHub Pages Deploy** - Calls `deploy-pages.yml`

**Stage 5: Release** (Conditional, requires all stages, main branch only)

- **Release Management** - Calls `release.yml` (only for changeset/, src/ or package.json changes)

**Benefits:**

- **Parallel efficiency**: All analysis runs simultaneously (3x faster than sequential)
- **Fast failure**: Any analysis failure stops the pipeline before expensive build operations
- **Resource optimization**: Build-dependent tasks only run after all checks pass
- **Conditional execution**: Performance tests only when source files change
- **Gated releases**: Releases only happen after all quality gates pass

### 2. **CI Workflow** (`.github/workflows/ci.yml`)

**Triggers:** Push to main, Pull requests, Workflow calls from default.yml

**Jobs:**

- **Test**: Runs on Node.js 22.x, 24.x
    - Checkout repository
    - Install dependencies (with pnpm cache)
    - Run tests with Vitest
    - Upload test coverage to Codecov
- **Build**: Builds package and uploads artifacts
    - Build with `microbundle`
    - Upload `dist/` and `examples/` as artifacts
- **Lint Markdown**: Validates all Markdown files

_Note: Linting has been moved to default.yml to avoid duplication_

### 3. **GitHub Pages Deployment** (`.github/workflows/deploy-pages.yml`)

**Triggers:** Push to main, Manual dispatch, Workflow calls from default.yml

**Features:**

- Builds the package
- Creates a comprehensive GitHub Pages site with:
    - All examples from `examples/` folder
    - Built assets from `dist/` folder for CDN usage
    - Auto-generated index page listing all examples
    - Updates example imports to use built polyfill
- Deploys to GitHub Pages with proper permissions

**CDN Access:** `https://cdn.jsdelivr.net/npm/css-if-polyfill/dist/index.modern.js`

### 4. **Release Workflow** (`.github/workflows/release.yml`)

**Triggers:** Git tags starting with `v*`

**Jobs:**

- **Test**: Full test suite before release
- **GitHub Release**: Creates GitHub release with changelog
- **npm Publish**: Publishes to npm registry (requires `NPM_TOKEN` secret)

### 5. **Code Quality** (`.github/workflows/quality.yml`)

**Triggers:** Push to main/develop, Pull requests, Workflow calls from default.yml

**Features:**

- Test coverage analysis with detailed reports
- Bundle size analysis
- Security vulnerability scanning
- Archives coverage reports as artifacts

_Note: Comprehensive linting has been moved to default.yml to avoid duplication_

### 6. **Performance Testing** (`.github/workflows/performance.yml`)

**Triggers:** Push/PR to main (when src/ changes), Manual dispatch, Workflow calls from default.yml

**Features:**

- Runs performance benchmarks using Playwright
- Tests initialization time and processing speed
- Fails if performance thresholds are exceeded
- Comments benchmark results on PRs
- Uploads performance results as artifacts

### 7. **Security Analysis** (`.github/workflows/codeql.yml`)

**Triggers:** Push to main, Pull requests, Scheduled (weekly), Manual dispatch, Workflow calls from default.yml

**Features:**

- Automated CodeQL security scanning for JavaScript and actions
- Detects potential security vulnerabilities
- Integrates with GitHub Security Advisory database
- Runs weekly on schedule for continuous monitoring

### 8. **Release Workflow** (`.github/workflows/release.yml`)

**Triggers:** Push to main (changeset changes), Manual dispatch

**Features:**

- Integrated with Changesets for version management
- Creates version PRs automatically
- Publishes to npm with proper provenance
- Generates GitHub releases with changelogs

_Note: This workflow remains independent as it handles specialized release processes_

### 9. **Audit Fix for Dependabot PRs** (`.github/workflows/audit-fix-pr.yml`)

**Triggers:** Dependabot PRs, Workflow calls from default.yml

**Features:**

- Automatically runs `npm audit fix` on Dependabot PRs
- Creates follow-up PRs with security fixes when audit issues are found
- Branches off the Dependabot PR for seamless integration
- Adds appropriate labels (`security`, `dependabot`) for easy tracking
- Only runs when Dependabot is the actor, minimizing unnecessary executions

**Workflow:**

1. Dependabot creates a PR with dependency updates
2. Audit-fix workflow detects it's a Dependabot PR
3. Runs `npm audit fix` to resolve any security vulnerabilities
4. If changes are found, creates a new PR based on the Dependabot branch
5. The new PR includes the audit fixes on top of the dependency updates

**Benefits:**

- **Proactive Security**: Catches and fixes security issues introduced by dependency updates
- **Modular Design**: Separate workflow file maintains clean separation of concerns
- **Automated Resolution**: Reduces manual intervention for common security fixes
- **Clear Tracking**: Separate PRs make it easy to review security changes independently

_Note: This workflow can run independently on PRs or be called from default.yml as part of the main pipeline_

## Workflow Architecture

### Parallel + Sequential Design

The new architecture optimizes for maximum efficiency with parallel analysis followed by sequential build-dependent tasks:

```text
Default.yml (Orchestrator)
├── Stage 1: Parallel Analysis (simultaneous)
│   ├── Lint & Code Style
│   ├── Quality Analysis (with embedded testing)
│   ├── Security Analysis (CodeQL)
│   └── Audit Fix for Dependabot (conditional)
├── Stage 2: CI Tests & Build (requires all Stage 1)
├── Stage 3: Performance Tests (conditional, requires Stage 2)
├── Stage 4: Deploy (main only, requires Stages 2-3)
└── Stage 5: Release (conditional, requires all previous stages)
```

**Key Optimizations:**

- **3x faster Stage 1**: Parallel execution instead of sequential
- **Embedded quality checks**: Tests run within quality job to avoid duplication
- **Embedded security**: CodeQL runs inline instead of calling separate workflow
- **Smart dependencies**: Build only happens after all analysis passes

### Standalone Workflows

Some workflows remain independent for specific use cases:

- **Release** (`release.yml`) - Handles changesets and publishing (now also integrated into default.yml)
- **Individual workflows** - Can still be triggered independently for debugging

### Removed Duplication

- **Linting**: Centralized in default.yml Stage 1
- **Setup/Dependencies**: Managed per workflow but coordinated
- **Build**: Streamlined through CI workflow
- **Security**: Dedicated stage in pipeline
- **Changeset workflow**: Removed duplicate `changeset.yml` (functionality preserved in `release.yml`)

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

All workflows use pnpm caching with `actions/setup-node@v4` to speed up dependency installation.

## Artifact Retention

- **Test coverage**: 30 days
- **Build artifacts**: 30 days
- **Performance results**: 30 days

## Security Features

- **CodeQL Analysis**: Automated security scanning
- **npm audit**: Dependency vulnerability checking
- **Dependabot**: Automated dependency updates
- **Audit Fix Automation**: Automatically suggests `npm audit fix` for Dependabot PRs by creating follow-up PRs with security fixes
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
2. Include pnpm caching
3. Add appropriate error handling
4. Upload relevant artifacts
5. Use semantic commit messages
