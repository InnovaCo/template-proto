/**
 * Конвертаци обычного JSON-дерева в DOM-дерево
 */
'use strict';

var Document = require('./dom/document');
var Element = require('./dom/element');
var Text = require('./dom/text');

var convert = module.exports = function(node, ctx) {
	if (node.type === 'root') {
		if (ctx) {
			throw new Error('Root node must be the first element');
		}

		let out = new Document();
		if (Array.isArray(node.children)) {
			node.children.forEach(function(child) {
				convert(child, out);
			});
		}
		return out;
	}

	if (node.type === 'text') {
		let out = new Text(node.value);
		ctx && ctx.appendChild(out);
		return out;
	}

	if (node.type === 'element') {
		let out = new Element(node.name);
		if (Array.isArray(node.attributes)) {
			node.attributes.forEach(function(attr) {
				out.setAttribute(attr.name, attr.value);
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