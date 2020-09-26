/**
 * Build-related utilities.
 *
 * @copyright Nick Freear, 13-July-2020.
 */

import * as geopoint from 'geopoint';
import togeojson from '@tmcw/togeojson';
import xmldom from 'xmldom';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';

// https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
// import { createRequire } from 'module';
// const __filename = fileURLToPath(import.meta.url); // >> __dirname ?

// console.log('ES6 modules:', geopoint, xmldom, togeojson);
// console.log(`Current directory: ${process.cwd()}`);

const GeoPoint = geopoint.default;
const ToGeoJson = togeojson;
const { DOMParser } = xmldom;

function loadDotEnv () {
  const ENV_PATH = makePath([ '.env' ]);
  const result = dotenv.config({ path: ENV_PATH });
  if (result.error) {
    console.error('DotEnv ERROR:', result.error);
    process.exit(1);
  }

  const ENV = parseEnvTypes(result.parsed);

  console.log('ENV:', ENV);

  return assertEnv(ENV);
}

function assertEnv (ENV) {
  const {
    TRACKS_SQLITE, GPX_INPUT, EXCLUDE_LAT, EXCLUDE_LONG, EXCLUDE_RADIUS_KM
  } = ENV;

  assert.ok(EXCLUDE_RADIUS_KM && EXCLUDE_RADIUS_KM > 0, 'EXCLUDE_RADIUS_KM');
  assert.ok(EXCLUDE_LAT && EXCLUDE_LAT !== 0, 'EXCLUDE_LAT');
  assert.ok(EXCLUDE_LONG && EXCLUDE_LONG !== 0, 'EXCLUDE_LONG');
  assert.ok(GPX_INPUT && GPX_INPUT !== '', 'GPX_INPUT');
  assert.ok(TRACKS_SQLITE && TRACKS_SQLITE !== '', 'TRACKS_SQLITE');
  return ENV;
}

// Convert from string to float, integer, etc.
function parseEnvTypes (envParsed) {
  let envResult = {};

  Object.entries(envParsed).forEach(([ key, value ]) => {
    // console.log(`${key}: ${value}`);

    if (/^-?\d+\.\d+$/.test(value)) {
      envResult[ key ] = parseFloat(value);
    }
    else if (/^-?\d+$/.test(value)) {
      envResult[ key ] = parseInt(value);
    }
    else {
      // TODO: Boolean ??
      envResult[ key ] = value;
    }
  });

  return envResult; // { error, parsed };
}

function makePath (parts) {
  return path.resolve(process.cwd(), ...parts);
}

async function writeJsonFile (filePath, data, prettyPrint = false) {
  const JSON_DATA = JSON.stringify(data, null, prettyPrint ? 2 : null);

  return await fs.promises.writeFile(filePath, JSON_DATA, 'utf8');
}

export { GeoPoint, DOMParser, ToGeoJson, loadDotEnv, makePath, writeJsonFile };
