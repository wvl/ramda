var fs = require('fs');

var header = 'var ramda = (function() {' + '\nvar ramda = {};\n\n';
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
        var needsExports = false;
        contents[name] = {
            text: lines.filter(function(line) {
                var match = line.match(/.*require\((?:'\.\/([^']*)'\)).*/);
                if (match) {
                    dependencies.push(match[1]);
                    return false;
                }
                return true;
            }).join('\n').replace(/module\.exports\s*=\s*{([^}]+)};?/m, function(exports, lines) {
                needsExports = true;
                return 'var ' + name + ' = {' + lines + '};';
            }).replace(/module\.exports\s*=\s*([^;\b]+);?/, function(exports, fnName) {
                return 'return ' + fnName + ';';
            }),
            dependencies: dependencies,
            filename: filename,
            needsExports: needsExports
        };
        onComplete();
    })
};

var getSortOrder = function(contents) {
    var allKeys = Object.keys(contents);
    var sorted = [], dependencyFree = allKeys.filter(function(key){
        return contents[key].dependencies.length === 0;
    }).reduce(function(obj, key) {obj[key] = true; return obj; }, {});
    while (Object.keys(dependencyFree).length) {
        var currentKey = Object.keys(dependencyFree)[0];
        sorted.push(currentKey);
        delete dependencyFree[currentKey];
        allKeys.forEach(function(key) {
            var node = contents[key];
            var dependencies = node.dependencies;
            var index = dependencies.indexOf(currentKey);
            if (index > -1) {
                dependencies.splice(index, 1);
                if (!dependencies.length) {dependencyFree[key] = true;}
            }
        });
    }
    if (allKeys.reduce(function(memo, key) {
        delete contents[key].dependencies;
        return memo.concat(contents[key].dependencies || []);
    }, []).length) {
        console.log("Cyclic dependency found");
        process.exit(400);
    }
    return sorted;
};

var invertDependencies = function(contents) {
    var results = {};
    Object.keys(contents).forEach(function(key) {
        (contents[key].dependencies || []).forEach(function(dep) {
            (results[dep] = results[dep] || []).push(key);
        });
    });
    return results;
};

var handleOutput = function(contents) {
    var crissCross = invertDependencies(contents);
    var keys = getSortOrder(contents);
    var text = (header + keys.map(function(key) {
        return (crissCross[key] ? 'var ' + key + ' = ' : '') + 'ramda.' + key + ' = ' + fileHeader + '    '
            + contents[key].text.split('\n').join('\n    ') +
            (contents[key].needsExports ? '\n\n' + '    return ' + key + ';' : '') + fileFooter;
    }).join('\n\n')).split('\n').join('\n    ') + footer;
    fs.mkdir("dist", function(err) {
        if (!err || (err.code === 'EEXIST')) {
            fs.writeFile('dist/ramda.generated.js', text, {encoding: 'utf8'}, function(err) {
                if (err) {
                    console.log(err);
                    process.exit(300);
                }
                console.log('The following files were combined into \'dist/ramda.generated.js\':' +
                    '\n    ' + keys.map(function(name) {return name + '.js';}).join('\n    '));
            });
        } else {
            console.log(err);
            process.exit(700);
        }
    });

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

