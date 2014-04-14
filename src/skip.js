var _ = require('./curry');
var slice = require('./core').slice;

// Returns a new list containing all **but** the first `n` elements of the given list.
var skip = _(function(n, list) {
    if (list && list.length === Infinity) {
        return list.skip(n);
    }
    return slice(list, n);
});

module.exports = skip;
