# Migration to pnpm Summary

This document summarizes the changes made to migrate the css-if-polyfill monorepo from npm to pnpm.

## Files Changed

### Configuration Files Added

- `pnpm-workspace.yaml` - pnpm workspace configuration
- `.npmrc` - pnpm configuration settings

### Package.json Changes

- **Root package.json**: Updated packageManager field and scripts to use pnpm
- **css-if-polyfill/package.json**: Updated scripts to use pnpm
- **postcss-if-function/package.json**: Updated scripts to use pnpm

### GitHub Workflows Updated

All workflows in `.github/workflows/` were updated to:

- Use `pnpm/action-setup@v3`
- Install pnpm version 9
- Use `pnpm install --frozen-lockfile` instead of `npm ci`
- Use `pnpm run` and `pnpm exec` instead of `npm run` and `npx`

### Documentation Updates

- `CONTRIBUTING.md` - Updated development commands to use pnpm
- `docs/` - Updated relevant documentation to reference pnpm commands

### Files Removed

- `package-lock.json` - Removed in favor of `pnpm-lock.yaml`

## Key Benefits

1. **Performance**: pnpm is faster than npm for installation and builds
2. **Disk Space**: pnpm uses symlinks to save disk space with shared dependencies
3. **Security**: pnpm has better security model with isolated dependencies
4. **Workspace Support**: Better monorepo support with pnpm workspaces

## Commands Changed

| npm command                         | pnpm equivalent                   |
| ----------------------------------- | --------------------------------- |
| `npm install`                       | `pnpm install`                    |
| `npm ci`                            | `pnpm install --frozen-lockfile`  |
| `npm run build --workspaces`        | `pnpm --recursive run build`      |
| `npm test --workspaces`             | `pnpm --recursive run test`       |
| `npx command`                       | `pnpm exec command`               |
| `npm run build --workspace=package` | `pnpm --filter=package run build` |

## Verification

✅ Build process works correctly
✅ Test suite passes
✅ CI/CD workflows updated
✅ Documentation updated
✅ Lockfile generated (`pnpm-lock.yaml`)

The migration is complete and all functionality has been preserved while gaining the benefits of pnpm.
