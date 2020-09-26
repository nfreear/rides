
# @nfreear/rides

My archive of ride data, with [Leaflet][]-powered map(s).

Process `GPX` files from mobile apps like [Bikeometer][app].
Display the resulting `GeoJSON` route-data on a [Leaflet][]-powered map.

```
npm run build
npm run db:export
npm start
```

Uses:

 * `@tmcw/togeojson`
 * `geopoint`
 * `markdown-it` (peer)
 * ES6 modules

© N Freear, 27-Oct-2019, 2020.

[app]: https://play.google.com/store/apps/details?id=com.fehmin.bikeometer&
  "Bike Computer - GPS Cycling Tracker, on Google Play / Android"
[leaflet]: https://leafletjs.com/
  "An open-source JavaScript library for mobile-friendly interactive maps"
