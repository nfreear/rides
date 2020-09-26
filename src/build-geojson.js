/**
 * Commandline (CLI) build script.
 *
 * Convert `track.gpx` to GeoJSON, excluding coordinates within a radius of a given location.
 *
 * @copyright Nick Freear, 13-July-2020.
 *
 * @see http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates
 * @see https://github.com/davidwood/node-geopoint
 * @see https://github.com/tmcw/togeojson
 * @see https://travelmath.com/cities/London,+United+Kingdom
 */

import { GeoPoint, DOMParser, ToGeoJson, loadDotEnv, makePath } from './utils.js';
import * as fs from 'fs';

// const statueOfLiberty = new GeoPoint(40.689604, -74.04455);

const { GPX_INPUT, EXCLUDE_LAT, EXCLUDE_LONG, EXCLUDE_RADIUS_KM } = loadDotEnv(); // Was: process.env()

const excludePoint = new GeoPoint(EXCLUDE_LAT, EXCLUDE_LONG);

const GPX_PATH = makePath(['data', `${GPX_INPUT}.gpx`]); // Was: , 'track.gpx' ]);
const GEO_JSON_PATH = makePath(['data', GPX_INPUT.replace(/(\.gpx|$)/, '.geojson.json')]);

const features = [];

const gpxDoc = new DOMParser().parseFromString(fs.readFileSync(GPX_PATH, 'utf8'));

const gpxGen = ToGeoJson.gpxGen(gpxDoc);

// console.log('Generator:', gen.next;
// process.exit();

const firstFeature = gpxGen.next().value;

// De-construct the 'first feature'.
const { time, coordTimes, speeds } = firstFeature.properties;
const { type, coordinates } = firstFeature.geometry;

const distances = [];

const includeCoords = coordinates.filter((coord, idx) => {
  const point = new GeoPoint(coord[1], coord[0]);
  const distance = excludePoint.distanceTo(point, true); // inKilometres = true;

  const IS_INCLUDED = distance > EXCLUDE_RADIUS_KM;

  distances.push(distance);

  return IS_INCLUDED;
});

const newFirstFeature = {
  type: 'Feature',
  properties: { time, coordTimes, speeds },
  geometry: { type, coordinates: includeCoords }
};

features.push(newFirstFeature);

for (const feature of gpxGen) {
  const { /* type, */ coordinates } = feature.geometry;
  const point = new GeoPoint(coordinates[1], coordinates[0]);
  const distance = excludePoint.distanceTo(point, true); // inKilometres = true;
  const IS_INCLUDED = distance > parseFloat(EXCLUDE_RADIUS_KM);

  if (IS_INCLUDED) {
    features.push(feature);
  }
}

const featureCollection = { type: 'FeatureCollection', features };

fs.writeFileSync(GEO_JSON_PATH, JSON.stringify(featureCollection), 'utf8');

console.log(0, 'Line string:', firstFeature);
// console.log(1, 'Next:', gpxGen.next().value)
// console.log(2, 'Next:', gpxGen.next().value)

console.log('Distances:', distances);
console.log('Coordinates:', coordinates.length, includeCoords.length);

/** @note ~ Unused code moved to `src/unused.js` */
