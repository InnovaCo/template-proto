/**
 * Класс для представления узла элемента
 */
'use strict';

var Node = require('./node');
var Attribute = require('./attribute');

module.exports = class Element extends Node {
	constructor(name) {
		if (!name) {
			throw new Error('Element name must be specified');
		}

		super(Node.ELEMENT_NODE);
		this.nodeName = name;
	}

	getAttribute(name) {
		var attr = this._attributes.get(name);
		return attr ? attr.value : void 0;
	}

	setAttribute(name, value) {
		if (name instanceof Attribute) {
			// replace attribute node
			return this.setAttributeNode(name);
		}

		var attr = this.getAttributeNode(name);
		if (!attr) {
			attr = new Attribute(name, value);
		} else {
			attr.value = value;
		}
		this.setAttributeNode(attr);
	}

	removeAttribute(name) {
		this._attributes.delete(name);
	}

	removeAttributeNode(attr) {
		for (var item of this._attributes) {
			if (item[1] === attr) {
				this._attributes.delete(item[0]);
				break;
			}
		}
	}

	hasAttribute(name) {
		return this._attributes.has(key);
	}

	getAttributeNode(name) {
		return this._attributes.get(name);
	}

	setAttributeNode(attr) {
		let prev = this._attributes.get(attr.name);
		if (prev && prev !== attr) {
			prev.remove();
		}
		this._attributes.set(attr.name, attr);
		attr.ownerElement = this;
	}

	getElementsByTagName(name) {
		throw new Error('Not implemented');
	}

	get tagName() {
		return this.nodeName;
	}

	get innerHTML() {
		return this._childNodes.map(stringify).join('');
	}

	get outerHTML() {
		return stringify(this);
	}
};

function stringify(node) {
	if (node.type === 'text') {
		return node.innerText;
	}

	if (node.type === 'element') {
		let attrs = node.attributes.map(function(attr) {
			return ` ${attr.name}="${attr.value}"`;
		}).join('');

		return `<${node.nodeName}${attrs}>${node._childNodes.map(stringify).join('')}</${node.nodeName}>`;
	}

	throw new TypeError('Unknown element type: ' + node.type);
};