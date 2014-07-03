var bldr = require('bldr')('ramda', __filename);
bldr.require('./core');
bldr.define('./curry');
bldr.define('./map');
bldr.define('./all');
bldr.define('./skip');
bldr.define('./filter');
module.exports = bldr.ramda;
