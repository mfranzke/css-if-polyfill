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
- Use `pnpm install` instead of `npm ci`
- Use `pnpm run` and `pnpm exec` instead of `npm run` and `npx`

### Documentation Updates

- `CONTRIBUTING.md` - Updated development commands to use pnpm
- `docs/` - Updated relevant documentation to reference pnpm commands

### Files Removed

- `package-lock.json` - Removed in favor of `pnpm-lock.yaml`

## Key Benefits

1. **Performance**: pnpm is faster than npm for installation and builds
2. **Disk Space**: pnpm uses symlinks to save disk space with shared dependencies
3. **Security**: pnpm has better security model with isolated dependencies (see detailed explanation on the section ""Better isolation prevents unauthorized dependency access" in the context of pnpm vs npm")
4. **Workspace Support**: Better monorepo support with pnpm workspaces with `--parallel` option

## Commands Changed

| npm command                         | pnpm equivalent                   |
| ----------------------------------- | --------------------------------- |
| `npm install`                       | `pnpm install`                    |
| `npm ci`                            | `pnpm install`                    |
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

## "Better isolation prevents unauthorized dependency access" in the context of pnpm vs npm

### The Problem with npm's Hoisting

**npm** uses a flat node_modules structure where dependencies are "hoisted" to the top level. This means:

```text
node_modules/
├── react/          # Your direct dependency
├── lodash/         # Hoisted from some sub-dependency
├── axios/          # Hoisted from some sub-dependency
└── moment/         # Hoisted from some sub-dependency
```

**Security issue**: Your code can `import lodash` even if you never declared it as a dependency in package.json. This is dangerous because:

1. You're using an undeclared dependency
2. If that sub-dependency removes lodash, your code breaks
3. You might accidentally use a vulnerable version

### pnpm's Isolated Approach

**pnpm** uses symlinks and keeps dependencies isolated:

```text
node_modules/
├── .pnpm/          # Actual packages stored here
│   ├── react@18.0.0/
│   ├── lodash@4.17.21/
│   └── axios@1.0.0/
└── react/          # Symlink to .pnpm/react@18.0.0/
```

**Security benefit**: You can ONLY access dependencies that are explicitly declared in your package.json. If you try to `import lodash` without declaring it, you get an error.

### Real Example

```javascript
// This works with npm (dangerous!)
import _ from "lodash"; // Not in package.json, but available due to hoisting

// With pnpm (secure!)
import _ from "lodash"; // Error: Cannot find module 'lodash'
```

### Why This Matters for Security

1. **Dependency Confusion**: Prevents accidentally using wrong/malicious packages
2. **Supply Chain**: Ensures you only use vetted, declared dependencies
3. **Reproducibility**: Guarantees the same dependency tree across environments
4. **Vulnerability Management**: Easier to audit since you know exactly what you're using

So when I say "prevents unauthorized dependency access," I mean pnpm stops your code from accidentally using dependencies you didn't explicitly choose and vet, which is a significant security improvement over npm's permissive hoisting behavior.
