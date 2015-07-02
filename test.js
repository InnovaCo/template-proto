'use strict';

var tree = require('./tree');
var transform = require('./lib/transform');
var convert = require('./lib/convert');
var stringify = require('./lib/stringify');
var parseXml = require('./lib/parse-xml').parseFile;

transform.registerHandler('value-of', function*(node, data, output) {
	output.pushText(data[node.getAttribute('select')]);
});

transform.registerHandler('attribute', function*(node, data, output) {
	output.pushAttribute(node.getAttribute('name'), node.getAttribute('value'));
});

var dom = parseXml('./data/example.xml');

console.log('Input:');
console.log(dom.innerHTML);

var result = transform(dom, {foo: 'bar'});
console.log('Output:');
console.log(result.innerHTML);
