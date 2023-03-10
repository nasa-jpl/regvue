# Changelog

All notable changes to the regvue project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

No unreleased changes.

## [1.1.5]

### Fixed
- Fixed "Script error." no field name rotation in Safari ([#290](https://github.jpl.nasa.gov/regvue/regvue/issues/290))

### Removed
- Removed latest version check ([#294](https://github.jpl.nasa.gov/regvue/regvue/pull/294))

## [1.1.4]

### Breaking Changes

This release has the potential to break existing Regvue JSON files that target v1 of the schema.
The schema requires all names (i.e. Element, Field, and EnumValue names) be valid C language identifiers.
Prior to this release, this requirement was not enforced.
With this release, attempting to load JSON that does not meet this requirement will result in an error.

### Fixed
- Fixed silent error when loading bad JSON via direct link ([#282](https://github.jpl.nasa.gov/regvue/regvue/issues/275)).
- Fixed lack of enforcement for the C language identifier format requirement for Element, Field, and EnumValue names ([#288](https://github.jpl.nasa.gov/regvue/regvue/issues/288)).

## [1.1.3]

### Changed
- Header links now open in a new tab ([#275](https://github.jpl.nasa.gov/regvue/regvue/issues/275)).

### Added
- Added sourcemap to aid debug in production ([#283](https://github.jpl.nasa.gov/regvue/regvue/issues/283)).

## [1.1.2]

### Fixed
- Fixed drag-n-drop errors for real this time ([#272](https://github.jpl.nasa.gov/regvue/regvue/issues/272)).

## [1.1.1]

### Fixed
- Fixed `BigInt` not found in older web views ([#257](https://github.jpl.nasa.gov/regvue/regvue/issues/257)).
- Fixed showing expand children button for child-less `blk` elements ([#270](https://github.jpl.nasa.gov/regvue/regvue/issues/270)).
- Fixed loading indicator not disappearing after a failed load ([#250](https://github.jpl.nasa.gov/regvue/regvue/pull/250)).
- Fixed styling of base and swap buttons and labels ([#262](https://github.jpl.nasa.gov/regvue/regvue/issues/262)).
- Fixed excessive memory usage loading malformed inputs ([#255](https://github.jpl.nasa.gov/regvue/regvue/issues/255)).
- Fixed drag-n-drop errors ([#272](https://github.jpl.nasa.gov/regvue/regvue/issues/272)).

### Dev
- Fixed VS Code not inserting final newline ([#265](https://github.jpl.nasa.gov/regvue/regvue/pull/265)).

## [1.1.0]

### Added
- Added a word swap button ([#245](https://github.jpl.nasa.gov/regvue/regvue/pull/245)).
- Added loading indicator when opening a file ([#243](https://github.jpl.nasa.gov/regvue/regvue/pull/243)).

### Changed
- RDF files are now fetched in parallel, reducing load time by over 50% ([#242](https://github.jpl.nasa.gov/regvue/regvue/pull/242)).

## [1.0.1]

### Fixed
- Fixed display issue with root sub-element table heading ([#240](https://github.jpl.nasa.gov/regvue/regvue/pull/240)).

## [1.0.0]
### Breaking Changes

This release contains several breaking changes to the schema.
See the [schema changelog](schema/CHANGELOG.adoc) for more details.

### Added
- Allows for spaces to be included while typing register and field values ([#228](https://github.jpl.nasa.gov/regvue/regvue/pull/228)).
- Added a display for mem elements ([#200](https://github.jpl.nasa.gov/regvue/regvue/pull/200)).
- Added the ability to customize which elements are expanded in the home view via the schema `expanded` property on the [Root](schema/register-description-format.adoc#root-object) object.
- Added support for relative URLs for IncludeElements

### Changed
- Additional properties on uploaded RDF files now return as errors ([#162](https://github.jpl.nasa.gov/regvue/regvue/pull/162)).
- Overhauled the [schema documentation](schema/register-description-format.adoc)

### Fixed
- Fixed text align for field descriptions in BlockTable component ([#229](https://github.jpl.nasa.gov/regvue/regvue/pull/229)).
- Prevent block table descriptions from overflowing and add a scroll bar for long descriptions ([#208](https://github.jpl.nasa.gov/regvue/regvue/pull/208)). 
- `offset` properties are now treated as BigInts, meaning they are now longer capped at 53 bits ([#141](https://github.jpl.nasa.gov/regvue/regvue/pull/141)).

## [0.7.0]
### Breaking Changes
The URL pattern was changed back in [0.5.2] from `/reg/blk.sub_blk.reg` to `/root/blk/sub_blk/reg`. Backwards compatible support was added for the original pattern, but this pattern requires a plugin that does not yet support Vite 3. So upgrading to Vite 3 means dropping support for the original url pattern.

### Added
- Added ability to control address map entry expansion ([#173](https://github.jpl.nasa.gov/regvue/regvue/pull/173)).
- Added support for HTML in enum doc descriptions ([#166](https://github.jpl.nasa.gov/regvue/regvue/pull/166)).
- Added the `Vitest` unit testing framework ([#158](https://github.jpl.nasa.gov/regvue/regvue/pull/158)).
- Added a validation check for the `schema.name` and `schema.version` properties ([#152](https://github.jpl.nasa.gov/regvue/regvue/pull/152)).

### Changed
- Prefer properties on include elements over the roots they fetch ([#176](https://github.jpl.nasa.gov/regvue/regvue/pull/176)).
- Upgraded from Vite 2.9.9 to Vite 3.0.3 ([#158](https://github.jpl.nasa.gov/regvue/regvue/pull/158)).
- Removed support for `.` in URLs ([#158](https://github.jpl.nasa.gov/regvue/regvue/pull/158)).

### Fixed
- Fixed bug affecting fields with named resets but missing the default reset ([#172](https://github.jpl.nasa.gov/regvue/regvue/pull/172)).
- Replace `\n` with `<br>` when displaying doc descriptions ([#171](https://github.jpl.nasa.gov/regvue/regvue/pull/171)).
- Fix regression and allow for HTML tags in field doc descriptions ([#155](https://github.jpl.nasa.gov/regvue/regvue/pull/155)).
- Fix nested children blocks being able to have no displayed addr ([#151](https://github.jpl.nasa.gov/regvue/regvue/pull/151)).
- Fixed the URL shown on the 404 page ([#150](https://github.jpl.nasa.gov/regvue/regvue/pull/150)).
- Allow for HTML in BlockPage doc descriptions just like in RegPage descriptions ([#147](https://github.jpl.nasa.gov/regvue/regvue/pull/147)).

## [0.6.5] - 2022-07-20
### Fixed
- Fix schema validation failing for decimal reset values ([#142](https://github.jpl.nasa.gov/regvue/regvue/pull/142)).
- Fixed display error that added a second "0x" to string offset values ([#139](https://github.jpl.nasa.gov/regvue/regvue/pull/139)).

## [0.6.4] - 2022-07-18
### Fixed
- Fixed version and display name not working for include blocks ([#136](https://github.jpl.nasa.gov/regvue/regvue/pull/136)).
- Fixed "0x0" not displaying in the block element table ([#135](https://github.jpl.nasa.gov/regvue/regvue/pull/135)).

## [0.6.3] - 2022-07-13
### Fixed
- Remove schema requirement for `root.name` ([#131](https://github.jpl.nasa.gov/regvue/regvue/pull/131)).

### Changed
- The `offset` property is now optional for `blk` elements. Empty offsets/addresses won't show in the menu ([#133](https://github.jpl.nasa.gov/regvue/regvue/pull/133)).
- Include elements are no longer replaced with the children of the fetched root, but instead merged with the fetched root and turned into a `blk` element ([#132](https://github.jpl.nasa.gov/regvue/regvue/pull/132)).

## [0.6.2] - 2022-07-13
### Added
- Added table to field description cell to show enumerated values ([#123](https://github.jpl.nasa.gov/regvue/regvue/pull/123)).
- Added support for 16 bit registers ([#110](https://github.jpl.nasa.gov/regvue/regvue/pull/110)).
### Fixed
- Fixed a bug resulting in incorrect offsets of elements fetched from include blocks ([#125](https://github.jpl.nasa.gov/regvue/regvue/pull/125)).
- Only display a single bit for the bit range of single bit fields ([#120](https://github.jpl.nasa.gov/regvue/regvue/pull/120)).
- Fixed numerous bug fixes affecting drap & drop, menu navigation, swapping display types, and loading include blocks ([#119](https://github.jpl.nasa.gov/regvue/regvue/pull/119)).

### Changed
- Removed the toggle menu button from the header. This button now shows on smaller screens on the bottom left of the screen ([#124](https://github.jpl.nasa.gov/regvue/regvue/pull/124)).
- Reimplemented schema validation using [JSON Schema](https://json-schema.org/) and [Ajv](https://ajv.js.org/) ([#110](https://github.jpl.nasa.gov/regvue/regvue/pull/110)).

## [0.6.1] - 2022-07-11

### Fixed
- Make `root.version` optional in validation check.

## [0.6.0] - 2022-07-11
### Added
- Added breadcrumb links to element pages ([#112](https://github.jpl.nasa.gov/regvue/regvue/pull/112)).
- Added support for multiple reset values ([#108](https://github.jpl.nasa.gov/regvue/regvue/pull/108)).
- Added support for enumerated field values ([#107](https://github.jpl.nasa.gov/regvue/regvue/pull/107)).
- Added the option to display the field table starting with LSB ([#106](https://github.jpl.nasa.gov/regvue/regvue/pull/106)).
- Added schema and semantic validation that checks uploaded/fetched data ([#103](https://github.jpl.nasa.gov/regvue/regvue/pull/103)).
- Added option for footer text to be set in `app.config.json` file ([#102](https://github.jpl.nasa.gov/regvue/regvue/pull/102)).
- Added support for nested inclusion of register descriptions ([#101](https://github.jpl.nasa.gov/regvue/regvue/pull/101)).

### Fixed
- Fixed bug when entering special characters in the search box ([#114](https://github.jpl.nasa.gov/regvue/regvue/pull/114)).
- Menu now closes when clicking grayed-out background in small screen display mode ([#111](https://github.jpl.nasa.gov/regvue/regvue/pull/111)).

## [0.5.2] - 2022-06-21
### Added
- The navigation menu can now be made wider/narrower with a resize bar ([#100](https://github.jpl.nasa.gov/regvue/regvue/pull/100)).
- Blocks now have a custom page that displays an overview of the entire block and all its sub-blocks and registers  ([#99](https://github.jpl.nasa.gov/regvue/regvue/pull/99)).

### Changed
-  The menu will automatically open/close when the window width changes and the menu display has been changed for smaller screens ([#100](https://github.jpl.nasa.gov/regvue/regvue/pull/100)).
- The URL schema now follows the pattern `/root/block/sub_block/register` instead of the previous `/reg/block.sub_block.register`. The previous URL schema will continue to be supported as backwards compatible at least until v1.0. ([#99](https://github.jpl.nasa.gov/regvue/regvue/pull/99)).

## [0.5.1] - 2022-06-16
### Added
- Any unexpected errors now result in a pop up modal regarding the error ([#92](https://github.jpl.nasa.gov/regvue/regvue/pull/92)).
- Added support for unknown values in bit encoding/decoding ([#46](https://github.jpl.nasa.gov/regvue/regvue/pull/46)).
- Added new features related to choosing data files ([#83](https://github.jpl.nasa.gov/regvue/regvue/pull/83)).
  - Recently opened urls are saved as cookies and shown as options when inputting a new url.
  - A hint will be shown if a new version of regvue is available.
  - Clicking the "Open a new design" icon button will display a modal inside the RegView page to select a new design instead of rerouting to `/open`.

### Fixed
- Allow searching on full doc description and not just first 50 characters ([#69](https://github.jpl.nasa.gov/regvue/regvue/pull/69)).
- Fixed overflowing names and accesses in the field layout table ([#65](https://github.jpl.nasa.gov/regvue/regvue/pull/65)).
- Allow dropping urls into the drop zone to open new data files ([#78](https://github.jpl.nasa.gov/regvue/regvue/pull/78)).

### Changed
- Dynamically calculate address from the offset attribute instead of using a hardcoded address ([#80](https://github.jpl.nasa.gov/regvue/regvue/pull/80)).
- `store.ts` has been reimplemented with Pinia ([#70](https://github.jpl.nasa.gov/regvue/regvue/pull/70)).
- Upgraded Cypress to 10.1.0 and added new tests for bit encoding/decoding and opening data files ([#89](https://github.jpl.nasa.gov/regvue/regvue/pull/89)).

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

[unreleased]: https://github.jpl.nasa.gov/regvue/regvue/compare/v1.1.5...HEAD
[1.1.5]: https://github.jpl.nasa.gov/regvue/regvue/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.jpl.nasa.gov/regvue/regvue/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.jpl.nasa.gov/regvue/regvue/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.jpl.nasa.gov/regvue/regvue/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.jpl.nasa.gov/regvue/regvue/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.jpl.nasa.gov/regvue/regvue/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.7.0...v1.0.0
[0.7.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.6.5...v0.7.0
[0.6.5]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.6.4...v0.6.5
[0.6.4]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.6.3...v0.6.4
[0.6.3]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.6.2...v0.6.3
[0.6.2]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.5.2...v0.6.0
[0.5.2]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.jpl.nasa.gov/regvue/regvue/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.jpl.nasa.gov/regvue/regvue/releases/tag/v0.1.0
