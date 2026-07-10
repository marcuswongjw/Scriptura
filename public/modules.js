// Scriptura course & module data — barrel re-export
// Content lives in content/concentrations.js and content/modules/*.js
import { concentrations } from './content/concentrations.js';
import { foundationsModules } from './content/modules/foundations.js';
import { genesisModules } from './content/modules/genesis.js';
import { exodusModules } from './content/modules/exodus.js';
import { leviticusModules } from './content/modules/leviticus.js';
import { numbersModules } from './content/modules/numbers.js';
import { deuteronomyModules } from './content/modules/deuteronomy.js';
import { historicalModules } from './content/modules/historical.js';
import { chronicles_returnModules } from './content/modules/chronicles_return.js';
import { wisdomModules } from './content/modules/wisdom.js';
import { prophetsModules } from './content/modules/prophets.js';
import { heavenModules } from './content/modules/heaven.js';
import { peterModules } from './content/modules/peter.js';
import { corinthiansModules } from './content/modules/corinthians.js';

export { concentrations };

export const modules = [
  ...foundationsModules,
  ...genesisModules,
  ...exodusModules,
  ...leviticusModules,
  ...numbersModules,
  ...deuteronomyModules,
  ...historicalModules,
  ...chronicles_returnModules,
  ...wisdomModules,
  ...prophetsModules,
  ...heavenModules,
  ...peterModules,
  ...corinthiansModules,
];
