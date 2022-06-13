# Changelog

All notable changes to the regvue project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Added new features related to choosing data files ([#83](https://github.jpl.nasa.gov/regvue/regvue/pull/83)).
  - Recently opened urls are saved as cookies and shown as options when inputting a new url.
  - A hint will be shown if a new version of regvue is available.
  - Clicking the "Open a new design" icon button will display a modal inside the RegView page to select a new design instead of rerouting to `/open`.

### Fixed
- Fixed overflowing names and accesses in the field layout table ([#65](https://github.jpl.nasa.gov/regvue/regvue/pull/65)).

## [0.5.0] - 2022-06-10

### Highlights

#### Simplified Installation, Upgrading, and Hosting

Regvue no longer needs to be installed (deployed) by end users.  End users can now use deployments managed by the Regvue team.  Going forward, end users will only need to manage their register descriptons JSON files.

Regvue can load register descriptions from the local filesystem via a file open dialog or via drag-and-drop OR load register descriptions from arbitrary URLs.  End users can create a direct link that pairs a Regvue deployment with a register description JSON file.

Drag-and-drop:

<img src="https://github.jpl.nasa.gov/storage/user/2262/files/58b9a800-e8f0-11ec-90d6-c7f605640a2f" alt="Drag-and-drop" width="600"/>

Open URL:

<img src="https://github.jpl.nasa.gov/storage/user/2262/files/59ead500-e8f0-11ec-8f12-427b386576cc" alt="Open URL" width="600"/>

For example, the v0.5 deployment is available at https://github.jpl.nasa.gov/pages/regvue/regvue/v0.5.  The demo register description can be loaded by appending `/#?data=https://github.jpl.nasa.gov/pages/regvue/regvue/demo/data.json`.  The end result is a direct link that loads the demo register description with the v0.5 deployment: https://github.jpl.nasa.gov/pages/regvue/regvue/v0.5/#?data=https://github.jpl.nasa.gov/pages/regvue/regvue/demo/data.json.

This allows a single deployment to service multiple designs.  This can also be used to provide multiple versions of a register description for a given design (e.g. `v1.1.json`, `v1.2.json`, etc).

The Regvue team will update existing deployments with bug fixes.  All existing links using these deployments will get new features and bug fixes automatically.  Breaking changes will be done by creating a new deployment.  Users can continue to use the older deployments unaffected or choose to opt-in to the newer versions by updating their links.

For example, the future `v1` deployment will be available at `https://github.jpl.nasa.gov/pages/regvue/regvue/v1`.  Users can create URLs that pair the `v1` deployment with their register description JSON file(s).  The `v1` deployment will be updated with new features and bug fixes.  If a breaking change is made, a future `v2` deployment will be made.  Users can then opt-in to the breaking changes by updating their URLs the new version.

#### Search Improvements

Search got a major overhaul.  Regvue now implements fuzzy search using the [Lunr.js](https://lunrjs.com/) search library.  Search now matches against the full hierarchical name (e.g. block.reg.field), address, and the first 50 characters of element descriptions.  Searching the full description will likely be supported in a future release (see [#69](https://github.jpl.nasa.gov/regvue/regvue/issues/69)).  Blocks are now included in the search results as well.

Additional search-related keyboard shortcuts have been added.  The available key board shortcuts are documented in the UI itself.

Lastly, several improvements were made to the search UI.

<img src="https://github.jpl.nasa.gov/storage/user/2262/files/d29a3780-e71e-11ec-8cc3-2f6bea82d5bb" alt="Search demo" width="600"/>

### Added
- Added an Open page at `/open` that will let users open a local `data.json` file or link to a file at a URL ([#66](https://github.jpl.nasa.gov/regvue/regvue/pull/66)).
- Added a 404 page ([#74](https://github.jpl.nasa.gov/regvue/regvue/pull/74)).
- Added a variety of new search features ([#64](https://github.jpl.nasa.gov/regvue/regvue/pull/64))
  - Added ability to search for blocks and fields
  - Added ability to search by full hierarchical name (e.g. block.reg.field)
  - Added ability to search by address
  - Added a keyboard shortcut to open the search box and icon to indicate the new shortcut
    - Defaults to CMD + K for Mac and Ctrl + K for Windows
  - Added icons to show available navigation keys that can be used in the search window
  - Improved the UI by adding outlines, better spaced margins, rounded corners, and a magnifying glass icon
- Included GitHub CLI in devcontainer.

### Fixed
- Persist the select display type and byte swap option on page reload ([#68](https://github.jpl.nasa.gov/regvue/regvue/pull/68)).
- Allow back button to navigate out of regvue by changing how to re-route at "/" ([#62](https://github.jpl.nasa.gov/regvue/regvue/pull/62)).

## [0.4.0] - 2022-06-06

### Added

- Added ability to have design version not included in header by setting equal to empty string ([#45](https://github.jpl.nasa.gov/regvue/regvue/pull/45)).
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

[unreleased]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.5.0...HEAD
[0.5.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.jpl.nasa.gov/regvue/regvue/releases/tag/v0.1.0
