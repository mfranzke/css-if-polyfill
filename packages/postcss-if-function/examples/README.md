# PostCSS Version Compatibility Testing

This directory contains test environments for different major versions of PostCSS to ensure our plugin works across multiple versions.

## Structure

- `postcss-version-7/` - Test environment for PostCSS v7.x
- `postcss-version-8/` - Test environment for PostCSS v8.x

Each directory contains:

- `package.json` - Specific PostCSS version dependency
- `test.test.js` - Test suite with comprehensive functionality tests
- `vitest.config.js` - Test configuration with version-specific environment

## Usage

### Run all version tests

```bash
npm run test:versions
```

### Run specific version tests

```bash
npm run test:version-7
npm run test:version-8
```

### Update peer dependencies package.json entry based on test results

```bash
npm run update:peer-deps
```

## How it works

1. Each test environment runs the same comprehensive test suite against different PostCSS versions
2. Tests verify core functionality: media() and supports() transformations, complex queries, comments handling, etc.
3. The `update:peer-deps` script runs all version tests and updates the `peerDependencies` field in package.json based on which versions pass
4. This ensures the peerDependencies range only includes actually tested and working versions
5. The plugin automatically detects and adapts to the PostCSS version being used

## Adding new PostCSS versions

To add support for a new PostCSS version:

1. Create a new directory: `postcss-version-X/`
2. Copy the structure from an existing version directory
3. Update the PostCSS version in the new `package.json`
4. Update the version number in `vitest.config.js`
5. Add the new version to the `versions` array in `../scripts/update-peer-deps.js`
6. Add a test script in the main `package.json`

## Current Compatibility

✅ **PostCSS 7.x** - Fully supported
✅ **PostCSS 8.x** - Fully supported

The plugin uses a hybrid approach that automatically detects the PostCSS version and adapts its API usage accordingly.
