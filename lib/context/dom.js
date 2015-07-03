/**
 * Вариация контекста преобразования для генерации DOM-дерева
 */
'use strict';
var AbstractContext = require('./abstract');
var Document = require('../dom/document');
var utils = require('../utils');
var debug = require('debug')('template:dom-context');

module.exports = class DOMContext extends AbstractContext {
	constructor(handlers) {
		super(handlers);
		this.output = new Document();
		this.outputCtx = this.output;
		this._doc = this.output.ownerDocument;
	}

	pushElement(name, attributes) {
		debug('push element %s', name);
		var elem = this._doc.createElement(name);
		this.outputCtx.appendChild(elem);
		this.outputCtx = elem;
		if (Array.isArray(attributes)) {
			for (let attr of attributes) {
				this.pushAttribute(attr.name, attr.value);
			}
		} else if (typeof attributes === 'object') {
			for (let name of Object.keys(attributes)) {
				this.pushAttribute(name, attributes[name]);
			}
		}
	}

	pushAttribute(name, value) {
		if (typeof name === 'object') {
			value = name.value;
			name = name.name;
		}
		
		debug('push attribute %s', name);
		this.outputCtx.setAttribute(name, value);
	}

	pushText(value) {
		debug('push text %s', value);
		var node = this._doc.createTextNode(utils.stringify(value));
		this.outputCtx.appendChild(node);
	}

	popElement() {
		debug('pop element');
		if (this.outputCtx.parentNode) {
			this.outputCtx = this.outputCtx.parentNode;
		}
	}

	transform(node) {
		super.transform(node);
		return this.output;
	}
};