/**
 * Преобразует указанное дерево в другое: на каждый найденный элемент вызывает
 * вызывает функцию, которая возвращает в контекст новый элемент
 */
'use strict';

var debug = require('debug')('template:transform');
var Context = require('./context');
var Document = require('./dom/document');
var Node = require('./dom/node');

var handlers = new Map();

module.exports = function(data, template, handlers) {
	var ctx = new Context(data, new Document(), handlers);

	for (var node of transform(template, ctx)) {
		debug('transforming %s', nodeStr(node));
		continue;
	}

	return ctx.output;
}

var transform = module.exports.transform = function*(node, ctx) {
	var handler = ctx.getHandlerForNode(node);
	for (var next of handler(node, ctx)) {
		yield next;
		yield* transform(next, ctx);
	}
}

function nodeStr(node) {
	switch (node.nodeType) {
		case Node.DOCUMENT_NODE: return '#document';
		case Node.TEXT_NODE: return `"${node.nodeValue}"`;
		case Node.ELEMENT_NODE: return `<${node.nodeName}>`;
		case Node.ATTRIBUTE_NODE: return `@${node.name}`;
	}
}