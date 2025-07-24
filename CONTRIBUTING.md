# Contributing

**Thank you for your interest in our project.** Contributions are always welcome. **Feel free to [open an issue](https://github.com/mfranzke/css-if-polyfill/issues/new) if you have any questions, ideas, or bugs to report, or submit pull requests to contribute code.**

We are committed to fostering a welcoming, respectful, and harassment-free environment, **so please be kind! 💖**

## Steps

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass and linting passes
5. Submit a pull request

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run vitest:watch

# Build distribution files
npm run build

# Run examples
npm run serve

# Lint code
npm run lint
```

### Development Scripts

The project includes several utility scripts in the `scripts/` directory to help with development and maintenance:

#### `scripts/build-docs.js`

Automatically generates documentation by injecting CSS test fixtures into markdown files.

```bash
node scripts/build-docs.js
```

This script:

- Scans for `<!-- FIXTURE: fixture-name -->` placeholders in markdown files
- Replaces them with the corresponding input/expected CSS from `test/fixtures/`
- Updates documentation files like `docs/TEST_FIXTURES.md` and package READMEs

#### `scripts/generate-fixtures.js`

Utility script for generating expected output files for new test fixtures by running them through the polyfill transformation engine.

```bash
node scripts/generate-fixtures.js
```

This script:

- Reads CSS from `.input.css` files in `test/fixtures/`
- Runs them through the `buildTimeTransform` function
- Generates corresponding `.expected.css` files
- Useful when adding new test cases to ensure correct expected outputs

**Note:** This script is primarily for development use when creating new fixtures. Modify the `newFixtures` array in the script to specify which fixtures to process.

### Test Fixture System

The project uses a centralized test fixture system located in `test/fixtures/` with pairs of `.input.css` and `.expected.css` files. This system is managed through `test/scripts/fixture-utils.js`.

#### Adding New Test Fixtures

1. **Create fixture files:**

    ```text
    test/fixtures/my-new-feature.input.css
    test/fixtures/my-new-feature.expected.css
    ```

2. **Add to fixture arrays in `test/scripts/fixture-utils.js`:**
    - `basicFixtureTests` - for build-time transformable features
    - `runtimeOnlyFixtureTests` - for runtime-only features
    - `postcssFixtureTests` - for PostCSS plugin tests

3. **Generate expected outputs (optional):**

    ```bash
    # Modify scripts/generate-fixtures.js to include your fixture
    node scripts/generate-fixtures.js
    ```

4. **Update documentation:**
    ```bash
    node scripts/build-docs.js
    ```

#### Fixture Categories

- **Build-time transformable**: Features that can be converted to native CSS (`@media`, `@supports`)
- **Runtime-only**: Features requiring JavaScript processing (`style()` queries, boolean negation, empty token streams)
- **PostCSS-specific**: Additional fixtures used only by the PostCSS plugin

For more details, see [`docs/TEST_FIXTURES.md`](docs/TEST_FIXTURES.md).
