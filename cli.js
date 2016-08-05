#!/usr/bin/env node
/**
 * minjson CLI tool
 *
 * The MIT License (MIT)
 *
 *  Copyright (c) 2015 Zoltan Frombach
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of
 *  this software and associated documentation files (the "Software"), to deal in
 *  the Software without restriction, including without limitation the rights to
 *  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 *  the Software, and to permit persons to whom the Software is furnished to do so,
 *  subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 *  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 *  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 *  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 *  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
/*jshint browser:false, node:true*/

'use strict';

var fs = require('fs');
var path = require('path');
var cli = require('cli');
var concat = require('concat-stream');
var appName = require('./package.json').name;
var appVersion = require('./package.json').version;
var minify = require('./jsonminifier.js');
var input = null;
var output = null;
var beautifyOptions = {
  compress: false,
  output: {
    beautify: true,
    quote_keys: true
  }
};
var minifyOptions = {
  compress: false,
  output: {
    beautify: false,
    quote_keys: true
  }
};

cli.width = 100;
cli.option_width = 40;
cli.setApp(appName, appVersion);

var usage = appName + ' [OPTIONS] [FILE]\n\n  If no input file specified then STDIN will be used for input.';

cli.setUsage(usage);

var cliOptions = {
  version: ['v', 'Version information'],
  output: ['o', 'Specify output file (if not specified STDOUT will be used for output)', 'file'],
  beautify: ['b', 'Beautify']
};

cli.parse(cliOptions);

cli.main(function(args, options) {

  function runMinify(original) {
    var status = 0;
    var minified = null;
    try {
      minified = minify(original, options.beautify ? beautifyOptions : minifyOptions);
    } catch(e) {
      status = 3;
      process.stderr.write('Error: Minification error:', e);
    }

    if (minified !== null) {
      // Write the output
      try {
        if (output !== null) {
          fs.writeFileSync(path.resolve(output), minified);
        } else {
          process.stdout.write(minified);
        }
      } catch(e) {
        status = 4;
        process.stderr.write('Error: Cannot write to output');
      }
    }
    cli.exit(status);
  }

  if (options.version) {
    process.stderr.write(appName + ' v' + appVersion);
    cli.exit(0);
  }

  if (args.length) {
    input = args;
  }

  if (options.output) {
    output = options.output;
  }

  if (input !== null) { // File(s) specified on the Command line ?

    if (input.length > 1) {
      process.stderr.write('Error: Too many command line arguments specified');
      cli.exit(1);
    }

    var afile = input[0]; // We only minify the first file specified on the Command Line (because it doesn't make sense to concatenate multiple JSON files)
    var original;
    try {
      original = fs.readFileSync(afile, 'utf8');
    } catch(e) {
      process.stderr.write('Error: Cannot read file ' + afile);
      cli.exit(2);
    }
    runMinify(original);
  } else { // Minifying input coming from STDIN
    process.stdin.pipe(concat({encoding: 'string'}, runMinify));
  }

});
