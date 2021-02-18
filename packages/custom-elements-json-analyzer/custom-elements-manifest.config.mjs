import ts from 'typescript'
import lit from './plugins/lit.js';
import summary from './plugins/summary.js';
// import stencil from './plugins/stencil.js';

export default {
  plugins: [
    // lit(),
    // stencil()
    summary()
  ]
}