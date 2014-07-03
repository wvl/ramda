// `slice` implemented iteratively for performance
var slice = module.exports = function (args, from, to) {
    var i, arr = [];
    from = from || 0;
    to = to || args.length;
    for (i = from; i < to; i++) {
        arr[arr.length] = args[i];
    }
    return arr;
};
