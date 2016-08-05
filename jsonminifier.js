/*jshint browser:false, node:true*/

var UglifyJS = require('uglify-js');

function jsonminifier(input, options) {
  var tmpVar = 'globalMinifyVariableByTSS',
      ast = UglifyJS.parse(tmpVar + ' = ' + input);
  if (options.compress) {
    ast.figure_out_scope();
    var compressor = UglifyJS.Compressor({booleans: false});
    ast = ast.transform(compressor);
  }
  var re = new RegExp('^' + tmpVar + '\\s*=\\s*([^]*?);?$'),
      stream = UglifyJS.OutputStream(options.output);
  ast.print(stream);
  return stream.toString().replace(re, '$1');
}

module.exports = jsonminifier;
