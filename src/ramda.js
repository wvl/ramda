var bldr = require('bldr')('ramda', __filename);
// core
bldr.define('./mkArgStr');
bldr.define('./slice');
bldr.define('./arity');
bldr.define('./nAry');

bldr.define('./curry');
bldr.define('./map');
bldr.define('./all');
bldr.define('./skip');
bldr.define('./filter');
module.exports = bldr.ramda;
