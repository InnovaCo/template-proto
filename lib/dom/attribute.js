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

		this.name = name;
		this.value = value;
		this.ownerElement = null;
	}

	remove() {
		if (this.ownerElement) {
			this.ownerElement.removeAttributeNode(this);
		}
	}
};