# SBB-Opendata-Visualization

D3.js app with open data from the Swiss Federal Railways.

See: [Demo](https://manuelbieri.github.io/SBB-Opendata-Visualization/)

## Data
The following data sources were used:
- Rolling Stock: [data.sbb.ch - Rolling Stock](https://data.sbb.ch/explore/dataset/jahresformation/information/)
- Traffic: [opentransportdata.swiss - Actual Data](https://opentransportdata.swiss/en/dataset/istdaten)
- Weather: [data.geo.admin.ch/](https://data.geo.admin.ch/ch.meteoschweiz.klima/nbcn-tageswerte/)

The merged [production](https://gist.githubusercontent.com/manuelbieri/5a20c884020ed05e89b3426e78ae97c5/raw/7c31a08bee5c661f9e71a003ea4b56deb33432aa/sbb_data_v2.json) and [preview](https://gist.githubusercontent.com/manuelbieri/5a20c884020ed05e89b3426e78ae97c5/raw/7c31a08bee5c661f9e71a003ea4b56deb33432aa/sbb_data_preview.json) data is located in this [gist](https://gist.github.com/manuelbieri/5a20c884020ed05e89b3426e78ae97c5).

## Dependencies
- [D3.js - v4](https://github.com/d3/d3) (BSD 3-Clause "New" or "Revised" License)
- [d3-force-reuse](https://github.com/twosixlabs/d3-force-reuse) (BSD 3-Clause "New" or "Revised" License)
- [ion.rangeSlider](https://github.com/IonDen/ion.rangeSlider) (MIT License)

### Visualization build upon
- [Creating Bubble Charts with D3v4 - Jim Vallandingham](https://vallandingham.me/bubble_charts_with_d3v4.html) - [License](https://github.com/vlandham/bubble_chart_v4/blob/master/LICENSE)

## Images
- Train images: [sbb.ch - Our trains](https://www.sbb.ch/de/bahnhof-services/waehrend-der-reise/unsere-zuege.html)