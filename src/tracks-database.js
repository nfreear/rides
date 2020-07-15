/**
 * Export JSON from a backup of the `tracks.bk` database (Bikeometer).
 *
 * @copyright Nick Freear, 13-July-2020.
 */

import { loadDotEnv, makePath, writeJsonFile } from './utils.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import * as fs from 'fs';

const TRACKS_JSON = 'tracks-db.json'; // Was: tracks-bk.json';
// const TRACKS_SQLITE='/Users/XXX/Downloads/tracks.bk';
const TRACK_TABLE = 'track_details_table';

export class TracksDatabase {

  getDbPath () {
    const { TRACKS_SQLITE } = loadDotEnv();
    const DB_PATH = makePath([ TRACKS_SQLITE ]);

    console.log('DB path:', DB_PATH);
    return DB_PATH;
  }

  async open () {
    sqlite3.verbose();

    this.db = await open({
      filename: this.getDbPath(),
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY
    });

    console.log('DB opened OK.');
  }

  async exportTracksJson () {
    const JSON_PATH = makePath([ 'data', TRACKS_JSON ]);

    const dbResult = await this.db.all(
      `SELECT * FROM ${TRACK_TABLE}
      WHERE _id > ?
      ORDER BY _id ASC`,
      0 // '%July 2020%'
    ); // WHERE col = ?`, 'test') // WHERE date LIKE ?

    this.data = {
      '#': `AUTO-GENERATED ~ ${new Date().toISOString()}`,
      tracks: []
    };

    dbResult.forEach((res, idx) => this.fixTrack(res, idx));

    // console.log('DB result:', this.data.tracks);

    const all = await this.db.all(`SELECT _id,date FROM ${TRACK_TABLE}`);

    console.log('All tracks in DB:', all.length, all);

    await writeJsonFile(JSON_PATH, this.data, true);

    console.log('JSON tracks file written:', JSON_PATH);
  }

  fixTrack (dbRow, idx) {
    const {
      _id, Time, Distance, avgSpeed, maxspeed, date,
      max_altitude, min_altitude, start_time, final_alt, initial_alt,
      calorie_count, note_text,
      start_timestamp, elapsed_seconds, finish_timestamp
    } = dbRow;

    // 'timestamps' are in milli-seconds - convert!
    const totalSeconds = (finish_timestamp - start_timestamp) / 1000.0;
    const pauseSeconds = fRound(totalSeconds - elapsed_seconds);

    const track = {
      _id,
      dateIso: new Date(start_timestamp).toISOString(), // Was: 'isoTime'
      distance: fRound(Distance / 1000), // Kilometres.
      rideTime: avgSpeed, // (string)
      avgSpeed: fRound(Time),
      maxSpeed: fRound(maxspeed),
      date, max_altitude, min_altitude,
      arrivalTime: start_time, // UTC + 1 = BST (string).
      final_alt, initial_alt,
      calorie_count: fRound(calorie_count),
      note_text: note_text ? note_text.replace(/\.\.+/g, '…') : null,
      start_timestamp, elapsed_seconds, finish_timestamp,
      totalSeconds, pauseSeconds
    }

    this.data.tracks.push(track);
  }
}

function fRound (fNumber, places = 4) {
  return parseFloat(Number.parseFloat(fNumber).toFixed(places));

  /* const FAC = Math.pow(10, places);
  return Math.round(parseFloat(fNumber) * FAC) / FAC; */
}

export async function exportTracks () {
  const DB = new TracksDatabase();

  await DB.open();
  await DB.exportTracksJson();
}

exportTracks();

/* CREATE TABLE user_data(_id INTEGER PRIMARY KEY AUTOINCREMENT, weight REAL, age INTEGER);
CREATE TABLE location_array(_id INTEGER PRIMARY KEY AUTOINCREMENT, lat REAL, lng REAL, alt INTEGER, speed REAL, timestamp INTEGER, trip_id INTEGER, is_un_paused INTEGER);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE track_details_table(_id INTEGER PRIMARY KEY AUTOINCREMENT, Time INTEGER, Distance INTEGER, avgSpeed INTEGER, maxspeed INTEGER, date INTEGER, max_altitude INTEGER, min_altitude INTEGER, start_time TEXT, final_alt INTEGER, initial_alt INTEGER, calorie_count INTEGER, note_text TEXT, start_timestamp INTEGER, elapsed_seconds INTEGER, finish_timestamp INTEGER);
CREATE TABLE android_metadata (locale TEXT)
*/

/* Result: {
  _id: 8,
  Time: 21.871728897094727,       -- Mean speed (km/h)
  Distance: 27418.642578125,      -- (metres)
  avgSpeed: '1:15:13',            -- Ride time
  maxspeed: 36.36095428466797,    -- (km/h)
  date: '13 Jul 2020 12:21:24',   -- BST (UTC+1)
  max_altitude: 162.44467163085938,
  min_altitude: 97.81210327148438,
  start_time: '13:50:29',         -- Arrival time.
  final_alt: 120.98820495605469,
  initial_alt: 118.05590057373047,
  calorie_count: 329.75758950566, -- Kcal.
  note_text: 'Broughton .. Brooklands... Salford... Cranfield... forest way... near A421 ... Salford ... Brooklands... Broughton (end)',
  start_timestamp: 1594639284104, -- Start time?
  elapsed_seconds: 4513,          -- Ride time = 1.2536 hours, or 1:15:13 !!
  finish_timestamp: 1594644629049
}                                 -- Total time = 1.48471 hours
                                  -- Pause time = 0.23109 hours, or 0:13:51 !!
*/
