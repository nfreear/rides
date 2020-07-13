/**
 * Build commandline (CLI) script.
 * Convert `track.gpx` to GeoJSON, excluding coordinates within a given radius of a location.
 *
 * @copyright Nick Freear, 13-July-2020.
 *
 * @see http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates
 * @see https://github.com/davidwood/node-geopoint
 * @see https://github.com/tmcw/togeojson
 * @see https://travelmath.com/cities/London,+United+Kingdom
 */

const GeoPoint = require('geopoint');
// const statueOfLiberty = new GeoPoint(40.689604, -74.04455);
const ToGeoJson = require('@tmcw/togeojson');
const DOMParser = require('xmldom').DOMParser;
const DotEnv = require('dotenv');
const fs = require('fs');
const join = require('path').join;

const ENV_PATH = join(__dirname, '..', '.env');
const result = DotEnv.config({ path: ENV_PATH });

console.log('ENV:', result.parsed);

const { GPX_INPUT, EXCLUDE_LAT, EXCLUDE_LONG, EXCLUDE_RADIUS_KM } = process.env;

const excludePoint = new GeoPoint(parseFloat(EXCLUDE_LAT), parseFloat(EXCLUDE_LONG));

const GPX_PATH = join(__dirname, '..', GPX_INPUT, 'track.gpx');
const GEO_JSON_PATH = join(__dirname, '..', GPX_INPUT, 'track.geojson.json');

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
  const point = new GeoPoint(coord[ 1 ], coord[ 0 ]);
  const distance = excludePoint.distanceTo(point, true); // inKilometres = true;
  const IS_INCLUDED = distance > parseFloat(EXCLUDE_RADIUS_KM);

  distances.push(distance);

  return IS_INCLUDED;
});

const newFirstFeature = {
  type: 'Feature',
  properties: { time, coordTimes, speeds },
  geometry: { type, coordinates: includeCoords }
}

features.push(newFirstFeature);

for (const feature of gpxGen) {
  const { type, coordinates } = feature.geometry;
  const point = new GeoPoint(coordinates[ 1 ], coordinates[ 0 ]);
  const distance = excludePoint.distanceTo(point, true); // inKilometres = true;
  const IS_INCLUDED = distance > parseFloat(EXCLUDE_RADIUS_KM);

  if (IS_INCLUDED) {
    features.push(feature);
  }
}

const featureCollection = { type: 'FeatureCollection', features };

fs.writeFileSync(GEO_JSON_PATH, JSON.stringify(featureCollection, null, 2), 'utf8');

console.log(0, 'Line string:', firstFeature);
// console.log(1, 'Next:', gpxGen.next().value)
// console.log(2, 'Next:', gpxGen.next().value)

console.log('Distances:', distances);
console.log('Coordinates:', coordinates.length, includeCoords.length);

process.exit();

// ---------------------------------------

function* infinite() {
    let index = 0;

    while (true) {
        yield index++;
    }
}

const generator = infinite(); // "Generator { }"

console.log(generator.next().value); // 0
console.log(generator.next().value); // 1
console.log(generator.next().value); // 2
// ...

process.exit();

const kml = new DOMParser().parseFromString(fs.readFileSync("foo.kml", "utf8"));

const converted = tj.kml(kml);

const convertedWithStyles = tj.kml(kml, { styles: true });
