/**
 * Результатирующее дерево трансформации
 */
'use strict';

var debug = require('debug')('template:output');
var Document = require('./dom/document');
var Element = require('./dom/element');
var Text = require('./dom/text');
var Attribute = require('./dom/attribute');

module.exports = class OutputTree {
	constructor() {
		this.root = new Document();
		this.ctx = this.root;
	}

	pushElement(name, attributes) {
		debug('push element %s', name);
		this.ctx = this.ctx.appendChild(new Element(name));
		if (Array.isArray(attributes)) {
			for (let attr of attributes) {
				if (attr instanceof Attribute) {
					this.pushAttribute(attr);
				} else {
					this.pushAttribute(attr.name, attr.value);
				}
			}
		} else if (typeof attributes === 'object') {
			for (let name of Object.keys(attributes)) {
				this.pushAttribute(name, attributes[name]);
			}
		}
	}

	pushAttribute(name, value) {
		if (name instanceof Attribute) {
			value = name.value;
			name = name.name;
		}
		
		debug('push attribute %s', name);
		this.ctx.setAttribute(name, value);
	}

	pushText(value) {
		debug('push text %s', value);
		this.ctx.appendChild(new Text(value));
	}

	popElement() {
		debug('pop element');
		if (this.ctx.parentNode) {
			this.ctx = this.ctx.parentNode;
		}
	}
}