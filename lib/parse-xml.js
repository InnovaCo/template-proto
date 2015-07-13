/**
 * Читает HTML-код в DOM-дерево
 */
'use strict';
var fs = require('fs');
var htmlparser = require('htmlparser2');
var Document = require('./dom/document');
var Element = require('./dom/element');
var Text = require('./dom/text');

module.exports = function(code) {
	var innerDom = htmlparser.parseDOM(code, {recognizeSelfClosing: true});
	var doc = new Document();
	for (var node of innerDom) {
		convert(node, doc);
	}

	return doc;
};

module.exports.parseFile = function(path) {
	return module.exports(fs.readFileSync(path, 'utf8'));
};

const defaultTypeProcessingList = [
	'tag',
	'style',
	'script'
];

function convert(node, ctx) {
	if (node.type === 'text') {
		let out = new Text(node.data);
		ctx && ctx.appendChild(out);
		return out;
	}

	if (~defaultTypeProcessingList.indexOf(node.type)) {
		let out = new Element(node.name);
		if (node.attribs) {
			Object.keys(node.attribs).forEach(function(name) {
				out.setAttribute(name, node.attribs[name]);
			});
		}
		ctx && ctx.appendChild(out);

		if (Array.isArray(node.children)) {
			node.children.forEach(function(child) {
				convert(child, out);
			});
		}

		return out;
	}

	throw new TypeError('Unknown element type: ' + node.type);
};
