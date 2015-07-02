/**
 * Класс для представляения корневого элемента дерева
 */
'use strict';

var Node = require('./node');
var Element = require('./element');
var Text = require('./text');
var Attribute = require('./attribute');

module.exports = class Document extends Node {
	constructor() {
		super(Node.DOCUMENT_NODE);
	}

	// createDocumentFragment()
	// createComment(data)
	// createCDATASection(data)
	// createProcessingInstruction(target, data)
	// createEntityReference(name)
	// importNode(importedNode, deep)

	createElement(tagName) {
		return new Element(tagName);
	}

	createTextNode(data) {
		return new Text(data);
	}

	createAttribute(name) {
		return new Attribute(name);
	}

	getElementsByTagName(name) {
		throw new Error('Not implemented');
	}

	getElementById(elementId) {
		throw new Error('Not implemented');
	}

	get innerHTML() {
		return this._childNodes.map(function(node) {
			return node.type === 'text' ? node.innerText : node.outerHTML;
		}).join('');
	}

	get outerHTML() {
		return this.innerHTML;
	}
};