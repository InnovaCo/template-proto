/**
 * Класс для представления узла элемента
 */
'use strict';

var Node = require('./node');
var Attribute = require('./attribute');
var nodeList = require('./node-list');

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
		return this._attributes.has(name);
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
		var out = nodeList();
		var all = (name === '*');
		for (var i = 0, il = this._childNodes.length; i < il; i++) {
			let node = this._childNodes[i];
			if (node.nodeType === Node.ELEMENT_NODE) {
				if (all || node.nodeName === name) {
					out.push(node);
				}
				out = out.concat(node.getElementsByTagName(name));
			}
		}
		return out;
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

// Данные элементы не могут содержать контент следовательно не могут иметь закрываюший тег.
// http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
const voidElementsList = [
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'keygen',
	'link',
	'menuitem',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
];

function stringify(node) {
	if (node.nodeType === Node.TEXT_NODE) {
		return node.nodeValue;
	}

	if (node.nodeType === Node.ELEMENT_NODE) {
		let attrs = node.attributes.map(function(attr) {
			return ` ${attr.name}="${attr.value}"`;
		}).join('');
		let nodeName = node.nodeName;

		if (~voidElementsList.indexOf(nodeName)) {
			return `<${nodeName}${attrs} />`;
		}
		return `<${nodeName}${attrs}>${node._childNodes.map(stringify).join('')}</${nodeName}>`;
	}

	throw new TypeError('Unknown element type: ' + node.nodeType);
};
