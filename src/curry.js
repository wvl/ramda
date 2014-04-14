var ramda = require('./core');
var arity = ramda.arity, slice = ramda.slice;

// Returns a curried version of the supplied function.  For example:
//
//      var discriminant = function(a, b, c) {
//          return b * b - 4 * a * c;
//      };
//      var f = curry(discriminant);
//      var g = f(3), h = f(3, 7) i = g(7);
//      i(4) ≅ h(4) == g(7, 4) == f(3, 7, 4) == 1
//
//  Almost all exposed functions of more than one parameter already have curry applied to them.
var curry = function(fn) {
    var fnArity = fn.length;
    var f = function(args) {
        return arity(Math.max(fnArity - (args && args.length || 0), 0), function () {
            var newArgs = (args || []).concat(slice(arguments, 0));
            if (newArgs.length >= fnArity) {
                return fn.apply(this, newArgs);
            }
            else {return f(newArgs);}
        });
    };

    return f([]);
};

module.exports = curry;

