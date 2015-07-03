/**
 * Класс для представления атрибута элемента
 */
'use strict';

var Node = require('./node');

module.exports = class Attribute extends Node {
	constructor(name, value) {
		if (!name) {
			throw new Error('Attribute name must be specified');
		}
		super(Node.ATTRIBUTE_NODE);

		this.nodeName = name;
		this.nodeValue = value;
		this.ownerElement = null;
	}

	get ownerDocument() {
		return ctx.ownerElement && ctx.ownerElement.ownerDocument;
	}

	get name() {
		return this.nodeName;
	}

	set name(value) {
		return this.nodeName = value;
	}

	get value() {
		return this.nodeValue;
	}

	set value(value) {
		return this.nodeValue = value;
	}
};