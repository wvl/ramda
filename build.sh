#!/bin/sh
node ./bin/build.js --output=dist/ramda.js
node ./bin/build.js --tags=core,math --output=dist/ramda.math.js
