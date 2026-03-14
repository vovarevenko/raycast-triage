# Changelog

The format is based on [Keep a Changelog]

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

### Internal

## [1.0.1] - 2026-03-14

### Added

- Year duration unit (`1y`, `2y`) for due dates

### Fixed

- Absolute dates without year (e.g. `01.01`) now auto-bump to next year if in past
- Today's date (e.g. `27.07` on July 27) stays in the current year

## [1.0.0] - 2026-03-14

### Added

- Quick-capture reminders via inline Raycast command
- Priority markers: `!` (low), `!!` (medium), `!!!` (high)
- Separate due date: relative `1d`, absolute `20.09`, with time `2d 14:30`
- URL cleanup — strips protocol and trailing slash
- Auto-create Reminders list if missing
- Configurable list name in preferences

<!-- Links -->

[Keep a Changelog]: https://keepachangelog.com/en/1.1.0

<!-- Links to versions -->

[unreleased]: https://github.com/vovarevenko/raycast-triage/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/vovarevenko/raycast-triage/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/vovarevenko/raycast-triage/releases/tag/v1.0.0
