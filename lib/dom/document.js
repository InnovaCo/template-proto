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
		return Element.prototype.getElementsByTagName.call(this, name);
	}

	getElementById(elementId) {
		throw new Error('Not implemented');
	}

	get ownerDocument() {
		return this;
	}

	get documentElement() {
		for (var i = 0, il = this._childNodes.length; i < il; i++) {
			if (this._childNodes[i].nodeType === Node.ELEMENT_NODE) {
				return this._childNodes[i];
			}
		}
	}

	get innerHTML() {
		return this._childNodes.map(function(node) {
			return node.nodeType === Node.TEXT_NODE ? node.nodeValue : node.outerHTML;
		}).join('');
	}

	get outerHTML() {
		return this.innerHTML;
	}
};