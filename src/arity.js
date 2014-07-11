var loadstar = require('loadstar')('ramda', __filename);
var mkArgStr = loadstar.require('./mkArgStr');

// Wraps a function that may be nullary, or may take fewer than or more than `n` parameters, in a function that
// specifically takes exactly `n` parameters.  Note, though, that all parameters supplied will in fact be
// passed along, in contrast with `nAry`, which only passes along the exact number specified.
var arity = module.exports = (function() {
    var cache = {};

    //     For example:
    //     cache[3] = function(func) {
    //         return function(arg0, arg1, arg2) {
    //             return func.apply(this, arguments);
    //         }
    //     };

    var makeN = function(n) {
        var fnArgs = mkArgStr(n);
        var body = [
            "    return function(" + fnArgs + ") {",
            "        return func.apply(this, arguments);",
            "    }"
        ].join("\n");
        return new Function("func", body);
    };

    return function(n, fn) {
        return (cache[n] || (cache[n] = makeN(n)))(fn);
    };
}());
