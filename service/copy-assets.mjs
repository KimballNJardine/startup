import { copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const assetFiles = [
  'city-location-pins.json',
  'destination-list.json',
  'usa-board-pins.json',
];

for (const assetFile of assetFiles) {
  const source = path.resolve(process.cwd(), '..', 'src', 'domain', 'data', assetFile);
  const destination = path.resolve(
    process.cwd(),
    'dist',
    'src',
    'domain',
    'data',
    assetFile,
  );

  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}
