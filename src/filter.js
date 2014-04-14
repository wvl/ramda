var curry = require('./curry');

// (Internal use only) The basic implementation of filter.
var internalFilter = curry(function(useIdx, fn, list) {
    if (list && list.length === Infinity) {
        return list.filter(fn); // TODO: figure out useIdx
    }
    var idx = -1, len = list.length, result = [];
    while (++idx < len) {
        if (!useIdx && fn(list[idx]) || fn(list[idx], idx, list)) {
            result.push(list[idx]);
        }
    }
    return result;
});

// Returns a new list containing only those items that match a given predicate function.
var filter = internalFilter(false);

// Like `filter`, but passes additional parameters to the predicate function.  Parameters are
// `list item`, `index of item in list`, `entire list`.
//
// Example:
//
//     var lastTwo = function(val, idx, list) {
//         return list.length - idx <= 2;
//     };
//     filter.idx(lastTwo, [8, 6, 7, 5, 3, 0 ,9]); //=> [0, 9]
filter.idx = internalFilter(true);

module.exports = filter;