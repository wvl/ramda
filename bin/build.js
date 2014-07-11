#!/usr/bin/env node
var path = require('path');
var fs = require('fs');
var docopt = require('docopt').docopt;
var loadstar = require('loadstar')('ramda', __filename, {appDir: path.join('..','src')});

var package = require('../package');
var doc = fs.readFileSync(path.join(__dirname, 'build.txt'), 'utf8');
var result = docopt(doc, {version: package.version, help: true});

var tagStructure = require('./tags');

var tags = result['--tags'] ? result['--tags'].split(',') : Object.keys(tagStructure);

tags.forEach(function(tag) {
  tagStructure[tag].forEach(function(file) {
    loadstar.define(path.join('..', 'src', file));
  });
});

var ramda = loadstar.make({amd: 'ramda'});

if (result['--output']) {
  fs.writeFileSync(result['--output'], ramda, 'utf8');
  console.log(result['--output']);
} else {
  console.log(ramda);
}
