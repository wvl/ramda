var loadstar = require('loadstar')('ramda', __filename);
var _ = loadstar.require('./curry');

// Returns `true` if all elements of the list match the predicate, `false` if there are any that don't.
var all = _(function (fn, list) {
    var i = -1;
    while (++i < list.length) {
        if (!fn(list[i])) {
            return false;
        }
    }
    return true;
});

module.exports = all;
