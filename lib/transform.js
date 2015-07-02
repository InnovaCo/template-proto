/**
 * Преобразует указанное дерево в другое: на каждый найденный элемент вызывает
 * вызывает функцию, которая возвращает в контекст новый элемент
 */
'use strict';

var debug = require('debug')('template:transform');
var convert = require('./convert');
var stringify = require('./stringify');
var OutputTree = require('./output-tree');
var Document = require('./dom/document');

var handlers = new Map();

module.exports = function(tree, data) {
	if (!(tree instanceof Document)) {
		debug('converting tree');
		tree = convert(tree);
	}

	var output = new OutputTree();
	for (var node of transform(tree, data, output)) {
		debug('transforming %s', nodeStr(node));
		continue;
	}

	return output.root;
}

module.exports.registerHandler = function(nodeName, gen) {
	handlers.set(nodeName, gen);
};

function* transform(node, data, output) {
	var handler = getHandlerForNode(node);
	for (var next of handler(node, data, output)) {
		yield next;
		yield* transform(next, data, output);
	}
}

function getHandlerForNode(node) {
	var handler;
	if (node.type === 'element') {
		handler = handlers.get(node.nodeName);
	}
	return handler || defaultHandler;
}

function* defaultHandler(node, data, output) {
	if (node.type === 'document') {
		for (let child of node.childNodes) {
			yield child;
		}
	} else if (node.type === 'element') {
		output.pushElement(node.nodeName, node.attributes);
		for (let child of node.childNodes) {
			yield child;
		}
		output.popElement();
	} else if (node.type === 'text') {
		output.pushText(node.nodeValue);
	} else if (node.type === 'attribute') {
		output.pushAttribute(node);
	}
}

function nodeStr(node) {
	switch (node.type) {
		case 'document': return '#document';
		case 'text': return `"${node.nodeValue}"`;
		case 'element': return `<${node.nodeName}>`;
		case 'attribute': return `@${node.name}`;
	}
}