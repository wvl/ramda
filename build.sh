#!/bin/sh
BLDR="./node_modules/.bin/bldr package ramda"
$BLDR src/ramda::dist/ramda.js --amd=ramda
$BLDR src/ramda.small::dist/ramda.small.js --amd=ramda
