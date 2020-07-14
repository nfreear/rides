
const INDEX_JSON = './data/index.json';

const L = window.L; // Leaflet.js.
const MD = window.markdownit();
const fetch = window.fetch;

drawMap();

async function drawMap () {
  const INDEX = await loadIndexJson();
  // const TRACKS = await loadAllTracksJson(INDEX);

  const M_ID = window.location.href.match(/\?d=(\d+-\d+-\d+)/);
  const DATE = M_ID ? M_ID[ 1 ] : INDEX.default.date;

  const RIDE = INDEX.rides.find(ride => ride.date === DATE); // Was: INDEX.rides[ DATE ]; // RIDES_INDEX[ DATE ];

  console.debug('(Ride):', RIDE);

  const LATLNG = INDEX.places.find(place => place.id === RIDE.centre).latLng; // Was: INDEX.locations[ RIDE.centre ];
  const ZOOM = RIDE.zoom || INDEX.default.zoom;

  const GEOJSON_URL = `./data/${ RIDE.geojson }`;
  const SUMMARY_URL = `./data/${ RIDE.summary }`;

  const mymap = L.map('mapid').setView(LATLNG, ZOOM);

  console.warn('Ride:', RIDE, LATLNG, GEOJSON_URL, mymap);

  L.tileLayer(INDEX.default.tileUrl, { // 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
  }).addTo(mymap);

  loadGeoJson(GEOJSON_URL, mymap);
  // loadSummary(SUMMARY_URL);

  var popup = L.popup()
    // .setLatLng(latlng)
    .setContent('<p>Hello world!<br />This is a nice popup.</p>')
    .openOn(mymap);
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

  console.warn('Tracks:', TRACKS);
  return TRACKS;
}

async function loadGeoJson(geoJsonUrl, mymap) {
  const response = await window.fetch(geoJsonUrl); // './data/' + RIDE.geojson);
  console.warn('Response:', response);

  const featureData = await response.json();
  console.warn('Features:', featureData)

  const FEATURES_LINE = [ featureData.features[ 0 ] ];

  L.geoJSON(FEATURES_LINE).addTo(mymap);
}

async function loadSummary(url) {
  const response = await window.fetch(url);
  const markdown = await response.text();

  document.querySelector('#summary').innerHTML = MD.render(markdown);
}
