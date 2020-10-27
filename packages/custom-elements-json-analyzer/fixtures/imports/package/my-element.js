// This fixture will not actually output anything, its just to locally test the gathering of imports
import defaultExport1 from 'foo';
import * as aggregate1 from './my-module.js';
import { export1, export2 } from 'foo';
import { export3 as alias1 } from 'foo';
import { export4, export5 as alias2 } from 'foo';
import defaultExport2, { export6 } from 'foo';
import defaultExport3, * as aggregate2 from 'foo';