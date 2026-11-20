import { constants, copyFileSync } from 'node:fs';

try {
  copyFileSync(new URL('../db.seed.json', import.meta.url), new URL('../db.json', import.meta.url),
    constants.COPYFILE_EXCL);
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}
