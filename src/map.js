/**
 * Render the map, using Leaflet.js
 *
 * @copyright Nick Freear, 27-Oct-2019, 13-July-2020.
 */

import { loadLeafletScript } from './load-script.js';
import { MapUtil } from './map-util.js';
import { trackDataTemplate } from './track-data-template.js';

const INDEX_JSON = './data/index.json';
// const DATE_PARAM_REGEX = /\?d=(20\d{2}-[01]\d-\d{2})/;
const DATE_PARAM_REGEX = /\?d=(\d{4}-\d{2}-\d{2})/; // Was:  /\?d=(\d+-\d+-\d+)/;

let L = null; // Leaflet.js.
const Markdown = window.markdownit();
const fetch = window.fetch;

(async () => {
  try {
    const result = await loadLeafletScript();

    const LS = window.L; // Leaflet.js.
    L = window.L;

    console.warn('Leaflet.js loaded OK:', LS.version, result);

    drawMap(LS);
  } catch (err) {
    console.error('ERROR:', err);
  }
})();

async function drawMap (L) {
  const util = new MapUtil();

  const INDEX = await loadIndexJson();

  const M_ID = window.location.href.match(DATE_PARAM_REGEX);
  const DATE = M_ID ? M_ID[1] : INDEX.default.date;

  const RIDE = INDEX.rides.find(ride => ride.date === DATE); // Was: INDEX.rides[ DATE ];

  console.debug('(Ride):', RIDE);

  if (!RIDE) {
    return errorNoRide(DATE, INDEX);
  }

  const LATLNG = INDEX.places.find(place => place.id === RIDE.centre).latLng; // Was: INDEX.locations[ RIDE.centre ];
  const ZOOM = RIDE.zoom || INDEX.default.zoom;

  const URLS = INDEX.dataUrl;
  const GEOJSON_URL = URLS.track.replace('{date}', DATE); // `./data/${ RIDE.geojson }`;
  const SUMMARY_URL = URLS.summary.replace('{date}', DATE); // `./data/${ RIDE.summary }`;

  const latLng = L.latLng(...LATLNG);
  const mymap = L.map(INDEX.default.mapId, { zoomSnap: 0.5 }).setView(latLng, ZOOM);

  console.warn('Ride:', RIDE, latLng, GEOJSON_URL, mymap);

  L.tileLayer(INDEX.default.tileUrl, { // 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18
  }).addTo(mymap);

  loadGeoJson(GEOJSON_URL, mymap);
  loadSummary(SUMMARY_URL);
  loadTrackJson(INDEX, RIDE, DATE);

  util.addDirectionArrow(mymap, latLng);

  util.demoPopup(mymap, latLng, INDEX);

  return { mymap };
}

function errorNoRide (DATE, INDEX) {
  const $EL = document.getElementById(INDEX.default.mapId);
  $EL.innerHTML = '<p class="error">Sorry. No ride found!</p>';
  console.error(`ERROR. No ride found for this date! "${DATE}"`);
}

async function loadIndexJson () {
  const response = await fetch(INDEX_JSON);
  const INDEX = await response.json();

  console.warn('Index:', INDEX);
  return INDEX;
}

async function loadAllTracksJson (INDEX) {
  const response = await fetch(INDEX.dataUrl.db);
  const TRACKS = await response.json();

  // console.warn('Tracks:', TRACKS);
  return TRACKS;
}

async function loadTrackJson (INDEX, RIDE, DATE) {
  const TRACKS_DB = await loadAllTracksJson(INDEX);
  const TRACK = TRACKS_DB.tracks.find(track => track.dateIso.match(DATE));

  console.warn('Tracks DB data:', TRACK);

  const TRACK_DIV = document.querySelector('#track-db'); // Useful ??
  // const TEMPLATE = document.querySelector('#track-template');
  // const CLONE = TEMPLATE.content.cloneNode(true);

  const markdown = trackDataTemplate(TRACK, RIDE);

  TRACK_DIV.innerHTML = Markdown.render(markdown);

  // tag`${CLONE}${TRACK}`;
  // TRACK_PRE.textContent = JSON.stringify(TRACK, null, '\t');
}

async function loadGeoJson (geoJsonUrl, mymap) {
  const response = await window.fetch(geoJsonUrl); // './data/' + RIDE.geojson);

  if (response.ok) {
    const featureData = await response.json();
    console.warn('Fetch GeoJSON features:', featureData, response);

    const FEATURES_LINE = [featureData.features[0]];

    L.geoJSON(FEATURES_LINE).addTo(mymap);
  } else {
    console.error('Fetch GeoJSON error:', response.status, response);
  }
}

async function loadSummary (url) {
  const $summaryEl = document.querySelector('#summary');
  const response = await window.fetch(url);

  if (response.ok) {
    console.debug('Fetch summary response:', response);
    const markdown = await response.text();
    $summaryEl.innerHTML = Markdown.render(markdown);
  } else {
    console.error('Fetch summary error:', response.status, response);
    $summaryEl.innerHTML = '<p class="no-summary-found">No summary found.';
  }
}
