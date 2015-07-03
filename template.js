'use strict';

var xpath = require('xpath');
var Node = require('./lib/dom/node');
var Template = require('./lib/template');
var parseXml = require('./lib/parse-xml').parseFile;

var templateXml = parseXml('./data/template.xml');
var model = parseXml('./data/model.xml');

console.log('Input:');
console.log(templateXml.innerHTML);

var template = new Template(templateXml);

var result = template.transform(model, {
	'attribute': function*(node, ctx) {
		ctx.pushAttribute(node.getAttribute('name'), node.getAttribute('value'));
	},
	'value-of': function*(node, ctx) {
		var expr = node.getAttribute('select');
		if (expr) {
			var result = xpath.select1(expr, ctx.context);
			if (result != null) {
				ctx.pushText(ctx.stringify(result));
			}
		}
	}
});
console.log('Output:');
console.log(result.innerHTML);
