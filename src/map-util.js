
export class MapUtil {
  constructor () {
    this.L = window.L; // Leaflet.js.
  }

  addDirectionArrow (mymap, latLng) {
    const RAD = 45;

    const directionIcon = this.L.icon({
      iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Clockwise_arrow.svg',
      // iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Counterclockwise_arrow.svg',
      // iconUrl: 'leaf-green.png',
      // shadowUrl: 'leaf-shadow.png',

      iconSize: [2 * RAD, 2 * RAD], // [38, 95], // size of the icon
      // shadowSize:   [50, 64], // size of the shadow
      iconAnchor: [RAD, RAD] // [22, 94], // point of the icon which will correspond to marker's location
      // shadowAnchor: [4, 62],  // the same for the shadow
      // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    this.L.marker(latLng, { icon: directionIcon }).addTo(mymap);
  }

  demoPopup (mymap, latLng, INDEX) {
    if (INDEX.default.popup) {
      const popup = this.L.popup()
        .setLatLng(latLng)
        .setContent('<p>Hello world!<br />"X" marks the centre.</p>')
        .openOn(mymap);

      return { mymap, popup };
    }
  }
}

// Experiment!
export function htmlTag (strings, template, data) {
  // console.log(strings.raw[0]);
  console.debug('TAG:', strings, template, data, template.raw);

  // template`${data.maxSpeed}`;
}
