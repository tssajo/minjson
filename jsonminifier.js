/*jshint browser:false, node:true*/

var UglifyJS = require('uglify-js');

function jsonminifier(input, options) {
  var tmpVar = 'globalMinifyVariableByTSS',
      re = new RegExp('^' + tmpVar + '\\s*=\\s*([^]*?);?$'),
      result = UglifyJS.minify(tmpVar + ' = ' + input, options);
  return result.code.replace(re, '$1');
}

module.exports = jsonminifier;
