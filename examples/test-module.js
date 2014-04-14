var map = require('../src/map');
var filter = require('../src/filter');
var skip = require('../src/skip');
var all = require('../src/all');

var square = function(x) {return x * x;};
var odd = function(n) {return !!(n % 2);};

console.log(map(square, [1, 2, 3, 4, 5]));
console.log(filter(odd, [8, 6, 7, 5, 3, 0, 9]));
console.log(filter.idx(function(val, idx) {return idx < 5;}, [8, 6, 7, 5, 3, 0, 0]));
console.log(skip(3, [8, 6, 7, 5, 3, 0, 9]));
console.log(all(odd, [3, 5, 7, 9, 11]));
console.log(all(odd, [3, 5, 7, 9, 10]));