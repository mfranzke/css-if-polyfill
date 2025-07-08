# Changesets Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for version management and releasing.

## How it works

1. **Create a changeset** when you make changes that should be released
2. **Changesets creates a Version PR** automatically when changesets are merged to main
3. **Merge the Version PR** to publish the package to npm

## Workflow

### 1. Adding a changeset

After making changes, run:

```bash
npx @changesets/cli
```

This will:

- Prompt you to select which packages to bump (in our case, just the main package)
- Ask for the type of change (major, minor, patch)
- Let you write a summary of the changes

The changeset will be saved in `.changeset/` and should be committed with your changes.

### 2. Version PR Creation

When you push changesets to the `main` branch, the **Changeset workflow** (`.github/workflows/changeset.yml`) will:

- Create or update a "Version Packages" PR
- This PR will contain version bumps and updated CHANGELOG.md

### 3. Publishing

When you merge the "Version Packages" PR, the **Release workflow** (`.github/workflows/release.yml`) will:

- Run tests and linting
- Build the package
- Publish to npm automatically
- Create a GitHub release

## Commands

### Create a changeset

```bash
npx changeset
```

### Preview what version would be released

```bash
npx changeset status
```

### Manually version packages (done automatically in CI)

```bash
npm run changeset:version
```

### Manually publish (done automatically in CI)

```bash
npm run changeset:release
```

## Example Workflow

1. **Make changes** to your code
2. **Run tests** to ensure everything works
3. **Create changeset**:

    ```bash
    npx changeset
    ```

    - Select package to bump
    - Choose version type (patch/minor/major)
    - Write summary: "Add media query change tracking"

4. **Commit and push**:
    ```bash
    git add .
    git commit -m "feat: add media query change tracking"
    git push origin main
    ```
5. **Changesets creates/updates Version PR** automatically
6. **Review and merge the Version PR**
7. **Package is published** automatically

## Changeset Types

- **patch**: Bug fixes (0.1.0 → 0.1.1)
- **minor**: New features (0.1.0 → 0.2.0)
- **major**: Breaking changes (0.1.0 → 1.0.0)

## Configuration

The changeset configuration is in `.changeset/config.json`:

```json
{
	"$schema": "https://cdn.jsdelivr.net/npm/@changesets/config@3.1.1/schema.json",
	"changelog": "@changesets/cli/changelog",
	"commit": false,
	"fixed": [],
	"linked": [],
	"access": "public",
	"baseBranch": "main",
	"updateInternalDependencies": "patch",
	"ignore": []
}
```

## Required Secrets

Make sure these secrets are configured in your GitHub repository:

- `NPM_TOKEN`: Your npm authentication token for publishing

## Benefits over manual tagging

1. **Automatic changelog generation** from changeset summaries
2. **Semantic versioning** enforced by changeset selection
3. **Review process** through Version PRs
4. **Batch releases** - multiple changesets can be released together
5. **Rollback capability** - don't merge the Version PR if you need to make more changes

## Troubleshooting

### No Version PR created

- Check that you have changesets in `.changeset/` directory
- Ensure the changeset workflow has proper permissions
- Check workflow logs in GitHub Actions

### Publishing fails

- Verify `NPM_TOKEN` secret is set correctly
- Check that package name is available on npm
- Ensure version doesn't already exist

### Manual emergency release

If you need to release manually:

```bash
npm run build
npm version patch  # or minor/major
npm publish
git push --tags
```
