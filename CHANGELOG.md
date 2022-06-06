# Changelog

All notable changes to the regvue project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2022-06-06

### Added

- Added ability to have design version not included in header by setting equal to empty string ([#45](https://github.jpl.nasa.gov/regvue/regvue/pull/45))
- Added `CHANGELOG.md` ([#53](https://github.jpl.nasa.gov/regvue/regvue/pull/53)).
- Made the display type selection buttons a button group with abbreviated names ([#41](https://github.jpl.nasa.gov/regvue/regvue/pull/41), [#43](https://github.jpl.nasa.gov/regvue/regvue/pull/43)).

### Removed

- No longer bolds the field description on hover ([#48](https://github.jpl.nasa.gov/regvue/regvue/pull/48)).

### Fixed

- Re-enabled HTML formatting in field doc descriptions ([#44](https://github.jpl.nasa.gov/regvue/regvue/pull/44)).
- Re-enabled automatic field names rotation based on available space in the table view. Fixes issue introduced in v0.3.0.

## [0.3.2] - 2022-06-01

### Added

- Added docs on how to create a new release.

### Fixed

- Fixed a bug that prevents loading the `data.json` file from a non-root installation by loading from a relative path instead of an absolute path.

## [0.3.1] - 2022-06-01

### Fixed

- Changed base url target in the vite config options to allow for the app to run in a non-root url location.

## [0.3.0] - 2022-06-01

### Refactored

- <b>Vite</b> is now used instead of Vue CLI. It is faster, provides live reload, and is ultimately where Vue is headed.
- <b>Typescript</b> is now used instead of Javascript. Typescript provides better type safety which ultimately leads to more maintainable code.
- The Vue <b>Composition API</b> is now used instead of the Options API. Vue is currently transitioning away from the Options API to the Composition API
- <b>Tailwind CSS</b> is now used instead of Bootstrap. Tailwind CSS is lighter and nicer to work with.

### Added

- Added recent search features.
- Added a devcontainer to capture the development environment and provide a consistent development environment across developers.
- Added ability to select base representation (bin, dec, hex).
- Added initial tests with Cypress.
- Added two-way update between field values and register value.
  <br>
  Two modes: field-input-register-output, register-input-field-output. Input is determined on update (e.g. if a user updates a field, then fields become input and register becomes output). Input is never modified by the application. Application only modifies output. Input is only validated. Output is only updated if all inputs are valid. If input is invalid, bad input is highlighted. Hint tool tips provide the user just-in-time documentation for valid input.
- Added auto format of source code on save.

### Changed

- The tree view has been significantly improved.
  - Removed PrimeVue dependency.
  - Reduced whitespace.
  - Reduced font size.
  - Fixed long entry names affecting address text alignment. Entry names have more room for more characters, if a name is still too long it gets truncated with an ellipse.
- Improved styling of search.
- Improved styling of regvue version info.

### Fixed

- The field details table now includes borders to more clearly delineate the rows ([#31](https://github.jpl.nasa.gov/regvue/regvue/pull/31)).
- Fixed "search doesn't work the first time". The issue no longer exists after refactor ([#33](https://github.jpl.nasa.gov/regvue/regvue/pull/33)).
- Fixed byte swapping.

### Known Issues

- Responsive rotation of field names has been temporarily removed and will be restored in a future release.

## [0.2.0] - 2022-03-08

### Added

- Added byte swap display functionality.

## [0.1.0] - 2022-02-23

### Added

- Initial release of regvue prototype.

[unreleased]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.4.0...HEAD
[0.4.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.jpl.nasa.gov/regvue/regvue/releases/tag/v0.1.0
