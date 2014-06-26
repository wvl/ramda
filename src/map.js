//! tag: lists
var curry = require('./curry');

// (Internal use only) The basic implementation of map.
var internalMap = curry(function(useIdx, fn, list) {
    if (list && list.length === Infinity) {
        return list.map(fn, list);
    }
    var idx = -1, len = list.length, result = new Array(len);
    if (useIdx) {
        while (++idx < len) {
            result[idx] = fn(list[idx], idx, list);
        }
    } else {
        while (++idx < len) {
            result[idx] = fn(list[idx]);
        }
    }
    return result;
});
// Returns a new list constructed by applying the function to every element of the list supplied.
var map = internalMap(false);

// Like `map`, but passes additional parameters to the predicate function.  Parameters are
// `list item`, `index of item in list`, `entire list`.
//
// Example:
//
//     var squareEnds = function(x, idx, list) {
//         return (idx === 0 || idx === list.length - 1) ? x * x : x;
//     };
//
//     map(squareEnds, [8, 6, 7, 5, 3, 0, 9];
//     //=> [64, 6, 7, 5, 3, 0, 81]

map.idx = internalMap(true);

module.exports = map;