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
- **Group or ungroup pins:** on desktop every place shows as its own pin; on phones nearby pins start grouped.
  A map button switches between the two (`?group=1` / `?group=0` in the address, or `data-group` on ejc.net, overrides
  the default).
- **Map styles:** the default is Light (OpenFreeMap Positron). A moon button turns the lights off (Dark: OpenFreeMap Dark
  brightened to charcoal) and back on, and a map-styles button lets visitors pick any background. All nine options are free and need no API
  key: OpenStreetMap (grey or colour), OpenFreeMap Light, Colourful, Dark (brightened) and Dusk (Fiord), Humanitarian (OSM France),
  Terrain (OpenTopoMap) and Satellite (NASA Blue Marble). Add `?basemap=positron` (or `osm`, `liberty`, `dark`,
  `fiord`, `hot`, `topo`, `satellite`) to the address to open with one; on ejc.net, `data-basemap` sets the default and
  `data-basemaps` which ones to offer.
- **Pins:** small dots, all the same size, coloured by format (chosen 12 Nov 2026). A project with several formats
  gets a split dot, main format first. The earlier designs can still be compared by
  adding `?pin=drop` (teardrop with icon), `?pin=circle` or `?pin=ring` to the address.

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
| `index.html` | Standalone preview, one file. It shows the ejc.net header (logo and menu, linking to the real site) so the map can be seen in context; on ejc.net the site's own header is used |
| `ejc-integration/live-journalism-map.twig` | Template for ejc.net (Craft CMS): the map plus EJC's own entry form (Formie) under it |
| `ejc-integration/live-journalism-map.css`, `.js` | The map's styles and script, for EJC's assets |
| `ejc-integration/test-harness.html` | Loads the integration files with the same data, for testing |

On ejc.net, the template renders EJC's real entry form with
`{{ craft.formie.renderForm('liveJournalismEntryForm') }}`, so submissions keep going to EJC's backend for review.

Map data © OpenStreetMap contributors.
