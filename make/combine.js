var FS = require('fs');
var Q = require("q");
var readdir = Q.denodeify(FS.readdir);
var readFile = Q.denodeify(FS.readFile);
var writeFile = Q.denodeify(FS.writeFile);
var mkdir = Q.denodeify(FS.mkdir);

var header = 'var ramda = (function() {' + '\nvar ramda = {};\n\n';
var footer = '\n' + '    return ramda;' + '\n\n' + '}());';
var fileHeader = '(function() {' + '\n';
var fileFooter = '\n' + '}());' + '\n\n';

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

var handle = function(filename, contents) {
    var name = filename.slice(0, filename.length - 3);
    return readFile('src/' + filename, {encoding: 'utf8'})
    .then(function(str) {
        var dependencies = [];
        var lines = str.split(/\r\n|\n|\r/);
        var needsExports = false;
        contents[name] = {
            text: lines.map(function(line) {
                // var match = line.match(/.*require\((?:'\.\/([^']*)'\)).*/);
                var match = line.match(/var(\s+)([^\s=]+)(\s*)=(\s*)require\('\.\/([^']+)'\)(.*)/);

                if (match) {
                    dependencies.push(match[5]);
                    if (match[2] === match[5]) {
                        return null;
                    } else {
                        return 'var' + match[1] + match[2] + match[3] + '=' + match[4] + match[5] + match[6];
                    }
                }
                return line;
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
    })
};

var getSortOrder = function(contents) {
    var allKeys = Object.keys(contents);
    var sorted = [], dependencyFree = allKeys.filter(function(key){
        return contents[key].dependencies.length === 0;
    }).reduce(function(obj, key) {obj[key] = true; return obj; }, {});
    while (Object.keys(dependencyFree).length) {
        var currentKey = Object.keys(dependencyFree).sort()[0];
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
        throw new Error("Cyclic dependency found");
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
    var dirCreated = false;
    return mkdir("dist")
    .then(function() {
        dirCreated = true;
    }).catch(function(err) {
        dirCreated =  (!err || (err.code === 'EEXIST'))
    }).done(function() {
        return dirCreated ? writeFile('dist/ramda.generated.js', text, {encoding: 'utf8'}).then(function() {
            console.log('The following files were combined into \'dist/ramda.generated.js\':' +
                '\n    ' + keys.map(function (name) {
                return name + '.js';
            }).join('\n    '));
        }) : Q.fcall(function() {return false;});
    });
};


(function main() {
    var contents = {};
    readdir('src').then(function(files) {
        return (files || []).filter(function(filename) {return filename.endsWith('.js');});
    }).then(function(jsFiles) {
        return Q.all(jsFiles.map(function(filename) {return handle(filename, contents)}));
    }).then(function() {
        handleOutput(contents);
    }).catch(function(error) {
        console.log(error);
        process.exit(100);
    }).done();
}());
