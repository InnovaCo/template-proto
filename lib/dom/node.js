/**
 * Базовый класс для представляения узла в дереве
 */
'use strict';

var nodeList = require('./node-list');

var Node = module.exports = class {
	constructor(type) {
		this.nodeType = type;
		this.nodeName = null;
		this.nodeValue = null;
		this.parentNode = null;
		this.nextSibling = null;
		this.previousSibling = null;

		this._childNodes = [];
		this._attributes = new Map();
	}

	get childNodes() {
		return this._childNodes.slice(0);
	}

	get firstChild() {
		return this._childNodes[0];
	}

	get lastChild() {
		return this._childNodes[this._childNodes.length - 1];
	}

	get attributes() {
		var out = nodeList();
		for (var attr of this._attributes.values()) {
			out.push(attr);
		}

		return out;
	}

	get ownerDocument() {
		return this.parentNode && this.parentNode.ownerDocument;
	}

	get localName() {
		return this.nodeName;
	}

	appendChild(node) {
		return insertChildAt(this, node, 'last');
	}

	insertBefore(node, prev) {
		var ix = this._childNodes.indexOf(prev);
		if (ix !== -1) {
			insertChildAt(this, node, ix);
		}
		return node;
	}

	removeChild(node) {
		var children = this._childNodes;
		var ix = children.indexOf(node);
		if (ix === -1) {
			return node;
		}

		var prev = children[ix - 1];
		var next = children[ix + 1];
		children.splice(ix, 1);

		if (prev) {
			prev.nextSibling = next;
		}

		if (next) {
			next.previousSibling = prev;
		}
	}

	replaceChild(newChild, oldChild) {
		var ix = this._childNodes.indexOf(oldChild);
		if (ix !== -1) {
			this.removeChild(oldChild);
			insertChildAt(this, newChild, ix);
		}
	}

	normalize() {
		throw new Error('Not implemented');
	}

	cloneNode(deep) {
		throw new Error('Not implemented');
	}

	hasChildNodes() {
		return !!this._childNodes.length;
	}

	hasAttributes() {
		return !!this._attributes.size();
	}
};

Node.ELEMENT_NODE = 1;
Node.ATTRIBUTE_NODE = 2;
Node.TEXT_NODE = 3;
Node.CDATA_SECTION_NODE = 4;
Node.ENTITY_REFERENCE_NODE = 5;
Node.ENTITY_NODE = 6;
Node.PROCESSING_INSTRUCTION_NODE = 7;
Node.COMMENT_NODE = 8;
Node.DOCUMENT_NODE = 9;
Node.DOCUMENT_TYPE_NODE = 10;
Node.DOCUMENT_FRAGMENT_NODE = 11;

function insertChildAt(parent, child, pos) {
	// remove child from previous parent
	if (child.parentNode) {
		child.parentNode.removeChild(child);
	}

	var children = parent._childNodes;
	if (pos === 'last') {
		pos = children.length;
	} else if (pos === 'first') {
		pos = 0;
	}

	pos = Math.min(Math.max(0, pos), children.length);
	var prev = children[pos - 1];
	var next = children[pos + 1];

	children.splice(pos, 0, child);
	child.parentNode = parent;
	child.previousSibling = prev;
	child.nextSibling = next;

	if (prev) {
		prev.nextSibling = child;
	}

	if (next) {
		next.previousSibling = child;
	}

	return child;
}