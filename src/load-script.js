/**
 *
 * @author NDF, 11-Oct-2020
 */

export async function loadLeafletScript () {
  const promise = await loadScript({
    if: isLocalhost,
    load: { src: 'src/leaflet-src.js' },
    elseLoad: {
      src: 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js',
      integrity: 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==',
      crossorigin: ''
    }
  });

  /* promise
  .then(res => console.warn('Loaded JS OK:', res))
  .catch(err => console.error('ERROR:', err)); */

  return promise;
}

// -----------------------------------------

export class MyLoadError extends Error {
  constructor (message = null, src, event) {
    message = message || 'Error loading Javascript.';
    super(message);
    this.name = 'MyLoadError';
    this.src = src;
    this.event = event;
    // Error.captureStackTrace(this, this.constructor);
  }
}

// -----------------------------------------

export async function loadScript (CFG = {}) {
  // console.debug('loadScript:', CFG, typeof CFG.if, typeof CFG.load);

  const promise = new Promise((resolve, reject) => {
    console.assert(typeof CFG.if === 'function', 'Input object must contain an `if` function');
    console.assert(typeof CFG.load === 'object', 'Input object must contain a `load` object');

    const IF_RESULT = CFG.if();
    const TO_LOAD = IF_RESULT ? CFG.load : CFG.elseLoad;

    const SCR = document.createElement('script');

    SCR.onload = event => {
      resolve({ src: TO_LOAD.src, event });
      // setTimeout(resolve, 10 * 1000);
    };

    SCR.onerror = event => {
      // reject({ error: new MyLoadError(), src: TO_LOAD.src, event });
      reject(new MyLoadError(null, TO_LOAD, event));
    };

    SCR.src = TO_LOAD.src;
    // Error: "Subresource Integrity: The resource 'https://unpkg.com/.../leaflet.js' has an integrity attribute, but the resource requires the request to be CORS enabled to check the integrity, and it is not. The resource has been blocked because the integrity cannot be enforced."
    // Was: SCR.integrity = TO_LOAD.integrity || '';
    SCR.crossorigin = TO_LOAD.crossorigin || '';

    /*
    SCR.addEventListener('load', event => resolve(event));
    SCR.addEventListener('error', event => reject(event)); */

    document.head.appendChild(SCR);
  });

  return promise;
}

export function isLocalhost () {
  return /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
}
