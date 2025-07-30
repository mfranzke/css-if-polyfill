# CSS if() Function Polyfill, PostCSS plugin and stylelint plugin

[![MIT license](https://img.shields.io/npm/l/css-if-polyfill.svg "license badge")](https://opensource.org/licenses/mit-license.php)
[![Default CI/CD Pipeline](https://github.com/mfranzke/css-if-polyfill/actions/workflows/default.yml/badge.svg)](https://github.com/mfranzke/css-if-polyfill/actions/workflows/default.yml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Open Source Love](https://badges.frapsoft.com/os/v3/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](CODE-OF-CONDUCT.md)

A modern JavaScript [polyfill](https://github.com/mfranzke/css-if-polyfill/tree/main/packages/css-if-polyfill), [PostCSS plugin](https://github.com/mfranzke/css-if-polyfill/tree/main/packages/postcss-if-function) and a [stylelint plugin](stylelint-config-if-function) (to extend to prevent lint errors) for the [CSS `if()` function](https://developer.mozilla.org/en-US/docs/Web/CSS/if) with **hybrid build-time and runtime processing**. Transforms CSS `if()` functions to native `@media` and `@supports` rules where possible, with runtime fallback for dynamic conditions.

## Contributing

Please have a look at our [CONTRIBUTION guidelines](CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE) file for details.
