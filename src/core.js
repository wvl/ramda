//! tag: core

// `slice` implemented iteratively for performance
var slice = function (args, from, to) {
    var i, arr = [];
    from = from || 0;
    to = to || args.length;
    for (i = from; i < to; i++) {
        arr[arr.length] = args[i];
    }
    return arr;
};

var mkArgStr = function(n) {
    var arr = [], idx = -1;
    while(++idx < n) {
        arr[idx] = "arg" + idx;
    }
    return arr.join(", ");
};

// Wraps a function that may be nullary, or may take fewer than or more than `n` parameters, in a function that
// specifically takes exactly `n` parameters.  Any extraneous parameters will not be passed on to the function
// supplied
var nAry = (function() {
    var cache = {};


    //     For example:
    //     cache[3] = function(func) {
    //         return function(arg0, arg1, arg2) {
    //             return func.call(this, arg0, arg1, arg2);
    //         }
    //     };

    var makeN = function(n) {
        var fnArgs = mkArgStr(n);
        var body = [
            "    return function(" + fnArgs + ") {",
            "        return func.call(this" + (fnArgs ? ", " + fnArgs : "") + ");",
            "    }"
        ].join("\n");
        return new Function("func", body);
    };

    return function(n, fn) {
        return (cache[n] || (cache[n] = makeN(n)))(fn);
    };
}());

// Wraps a function that may be nullary, or may take fewer than or more than `n` parameters, in a function that
// specifically takes exactly `n` parameters.  Note, though, that all parameters supplied will in fact be
// passed along, in contrast with `nAry`, which only passes along the exact number specified.
var arity = (function() {
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

module.exports = {
    slice: slice,
    nAry: nAry,
    arity: arity
};