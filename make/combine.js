var fs = require('fs');

var header = 'var ramda = (function() {' + '\n';
var footer = '\n' + '    return ramda;' + '\n\n' + '}());';
var fileHeader = '(function() {' + '\n';
var fileFooter = '\n' + '}());' + '\n\n';

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

var handle = function(filename, contents, onComplete) {
    var name = filename.slice(0, filename.length - 3);
    fs.readFile('src/' + filename, {encoding: 'utf8'}, function(err, str) {
        if (err) {
            console.log(err);
            process.exit(200);
        }
        var dependencies = [];
        var lines = str.split(/\r\n|\n|\r/);
        contents[name] = {
            text: lines.filter(function(line) {
                var match = line.match(/.*require\((?:'\.\/([^']*)'\)).*/);
                if (match) {
                    dependencies.push(match[1]);
                    return false;
                }
                return true;
            }).join('\n').replace(/module\.exports\s*=\s*{([^}]+)};?/m, function(exports, lines) {
                var results = [];
                lines.replace(/\s*([^:\s]*):\s*([^,\s]*)/g, function(mapping, fnName, localName) {
                    results.push('ramda.' + fnName + ' = ' + localName + ';');
                    return mapping; // doesn't matter, using only side-effects.
                });
                return results.join('\n');
            }).replace(/module\.exports\s*=\s*([^;\b]+);?/, function(exports, fnName) {
                return 'ramda.' + fnName + ' = ' + fnName + ';';
            }),
            dependencies: dependencies,
            filename: filename
        };
        onComplete();
    })
};

var getSortOrder = function(contents) {
    return Object.keys(contents).sort();
};

var handleOutput = function(contents) {
    var keys = getSortOrder(contents);
    var text = (header + fileHeader + '    ' + keys.map(function(key) {
        return '    ' + contents[key].text.split('\n').join('\n    ');
    }).join(fileFooter + fileHeader) + fileFooter).split('\n').join('\n    ') + footer;
    fs.writeFile('dist/ramda.generated.js', text, {encoding: 'utf8'}, function(err) {
        if (err) {
            console.log(err);
            process.exit(300);
        }
        console.log('The following files were combined into \'dist/ramda.generated.js\':' +
            '\n    ' + keys.map(function(name) {return name + ".js";}).join('\n    '));
    })
};

fs.readdir('src', function(err, files) {
    var count = 0;
    var contents = {};
    if (err) {
        console.log(err);
        process.exit(100);
    }
    var onComplete = function() {
        if (--count <= 0) {
            handleOutput(contents);
        }
    };
    (files || []).filter(function(filename) {return filename.endsWith('.js');})
    .forEach(function(filename) {
        count++;
        process.nextTick(function() {handle(filename, contents, onComplete)});
    });
});

