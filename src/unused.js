
import { DOMParser, ToGeoJson } from './utils.js';
import * as fs from 'fs';

const tj = ToGeoJson;

export function unusedToGeoJson () {
  // process.exit();

  // ---------------------------------------

  const generator = infinite(); // "Generator { }"

  console.log(generator.next().value); // 0
  console.log(generator.next().value); // 1
  console.log(generator.next().value); // 2
  // ...

  // process.exit();

  const kml = new DOMParser().parseFromString(fs.readFileSync('foo.kml', 'utf8'));

  const converted = tj.kml(kml);

  const convertedWithStyles = tj.kml(kml, { styles: true });

  return { converted, convertedWithStyles };
}

function * infinite () {
  let index = 0;

  while (true) {
    yield index++;
  }
}
