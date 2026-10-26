# SP–DC–NET

A monochrome glass-style technical resource library for service provider and data center networking, designed for GitHub Pages.

## Main sections

- Home
- Lab Writeups
- Networking Notes
- EVE-NG Images

## Project structure

```text
/
├── index.html
├── contents.json
├── assets/
│   ├── css/style.css
│   └── js/app.js
└── documents/
    ├── lab-writeups/
    ├── networking-notes/
    └── eve-ng-images/
```

## Add a PDF resource

1. Upload the PDF to the appropriate folder under `documents/`.
2. Add an object to the `resources` array in `contents.json`.
3. Set its `title`, `category`, `description`, `type`, `file`, `date`, `updated`, and optional `tags` and `version`.
4. Commit and push. The resource cards and category counts update automatically after the deployed page loads.

Example:

```json
{
  "title": "BGP Route Reflection",
  "category": "Networking Notes",
  "description": "Route-reflector concepts, configuration, and verification.",
  "type": "PDF",
  "file": "documents/networking-notes/bgp-route-reflection.pdf",
  "date": "2026-10-26",
  "updated": "2026-10-26",
  "tags": ["BGP", "Route Reflection"],
  "version": "REFERENCE"
}
```

Supported categories are exactly `Lab Writeups`, `Networking Notes`, and `EVE-NG Images`. The Home navigation displays all resources.

## Notes

- Counts are calculated from `contents.json`; they are not manually hard-coded.
- The example entries are sample index records. Their PDF paths must exist before those documents can be opened.
- GitHub Pages serves the site as static files; no server or database is required.
- In repository settings, enable GitHub Pages from the `main` branch and `/(root)` if Pages is not already configured.
