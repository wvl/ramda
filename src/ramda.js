var loadstar = require('loadstar')('ramda', __filename);
// core
loadstar.define('./mkArgStr');
loadstar.define('./slice');
loadstar.define('./arity');
loadstar.define('./nAry');

loadstar.define('./curry');
loadstar.define('./map');
loadstar.define('./all');
loadstar.define('./skip');
loadstar.define('./filter');
module.exports = loadstar.ramda;
