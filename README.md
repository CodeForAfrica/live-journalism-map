# Live Journalism Map: prototype

A proposed new version of the [European Journalism Centre](https://ejc.net)'s
[Live Journalism map](https://ejc.net/resources/live-journalism-map), shared for EJC's review.
**This is a draft, not the live ejc.net page.**

**Preview:** https://codeforafrica.github.io/live-journalism-map/

Built by Code for Africa for EJC, fellow members of the Plus alliance.

## What's in it

- **Open-source map:** [Leaflet](https://leafletjs.com) with free [OpenStreetMap](https://www.openstreetmap.org/copyright)
  tiles, so there's no API key or account to manage. The tile provider is a setting (`data-tile-*` attributes on
  `#resourceMap`), so EJC can switch to another OpenStreetMap-based service without changing code.
- **Works on phones:** Map/List toggle, a details sheet that slides up from the bottom, a filters sheet, and two-finger
  panning so the page still scrolls past the map.
- **Filters and categories:** EJC's four types of live journalism, each with its own colour and icon, plus filters
  by type (also from the clickable key), country or region and event date, search, and shareable links for any view.
- **"Add your project":** a button at the top right of the map scrolls down to the entry form under the map.

## Data

The map shows the 39 projects published on ejc.net's Live Journalism map as of 10 Nov 2026.

**One test entry goes further:** Live Magazine shows how one project can have several places and dates while
keeping one project page and one link, and counting once. Its Paris place is approved. The other seven places come
from Live Magazine submissions still awaiting EJC review, and each is labelled as such. Their dates come from
livemagazine.com.

Personal details of the people who submitted entries are not included. The form under the map in this preview is a
copy for demonstration: it checks answers but **sends nothing**.

## Files

| Path | What it is |
|---|---|
| `index.html` | Standalone preview, one file |
| `ejc-integration/live-journalism-map.twig` | Template for ejc.net (Craft CMS): the map plus EJC's own entry form (Formie) under it |
| `ejc-integration/live-journalism-map.css`, `.js` | The map's styles and script, for EJC's assets |
| `ejc-integration/test-harness.html` | Loads the integration files with the same data, for testing |

On ejc.net, the template renders EJC's real entry form with
`{{ craft.formie.renderForm('liveJournalismEntryForm') }}`, so submissions keep going to EJC's backend for review.

Map data © OpenStreetMap contributors.
