var mkArgStr = module.exports = function(n) {
    var arr = [], idx = -1;
    while(++idx < n) {
        arr[idx] = "arg" + idx;
    }
    return arr.join(", ");
};
