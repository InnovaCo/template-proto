/**
 * Контекст трансформации дерева: захватывает текущий контекстный элемент
 * и предоставляет интерфейс для вывода данных
 */
'use strict';

var debug = require('debug')('template:context');
var avt = require('./avt');
var Node = require('./dom/node');

module.exports = class Context {
	constructor(input, output, handlers) {
		this.input = input;
		this.output = output;
		this._doc = output.ownerDocument;
		this.outputCtx = this.output;

		this._handlers = new Map();
		this._context = [];

		if (handlers) {
			Object.keys(handlers).forEach(function(nodeName) {
				this.registerHandler(nodeName, handlers[nodeName]);
			}, this);
		}

		this.enter(input);
	}

	enter(elem) {
		this._context.push(elem);
		return elem;
	}

	leave() {
		if (this._context.length > 1) {
			return this._context.pop();
		}
	}

	get context() {
		return this._context[this._context.length - 1];
	}

	evalAVT(str, context) {
		return avt(str, context || this.context);
	}

	registerHandler(nodeName, gen) {
		this._handlers.set(nodeName, gen);
	}

	getHandlerForNode(node, gen) {
		var handler;
		if (node.nodeType === Node.ELEMENT_NODE) {
			handler = this._handlers.get(node.nodeName);
		}
		return handler || defaultHandler;
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
		if (isAttributeNode(name)) {
			value = name.value;
			name = name.name;
		}
		
		debug('push attribute %s', name);
		this.outputCtx.setAttribute(name, value);
	}

	pushText(value) {
		debug('push text %s', value);
		var node = this._doc.createTextNode(value);
		this.outputCtx.appendChild(node);
	}

	popElement() {
		debug('pop element');
		if (this.outputCtx.parentNode) {
			this.outputCtx = this.outputCtx.parentNode;
		}
	}

	stringify(obj) {
		if (typeof obj === 'object' && 'nodeType' in obj) {
			if (obj.nodeType === Node.ELEMENT_NODE) {
				return innerText(obj);
			}

			if (obj.nodeType === Node.ATTRIBUTE_NODE) {
				return obj.value;
			}

			return 'nodeValue' in obj ? obj.nodeValue : '';
		}

		return String(obj);
	}
}

function isAttributeNode(obj) {
	return typeof obj === 'object' && obj.nodeType === Node.ATTRIBUTE_NODE;
}

function innerText(node) {
	if ('innerText' in node) {
		return node.innerText;
	}

	return node.childNodes.map(function(node) {
		if (node.nodeType === Node.TEXT_NODE) {
			return node.nodeValue;
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			return innerText(node);
		}
		return '';
	}).join('');
}

function* defaultHandler(node, ctx) {
	if (node.nodeType === Node.DOCUMENT_NODE) {
		for (let child of node.childNodes) {
			yield child;
		}
	} else if (node.nodeType === Node.ELEMENT_NODE) {
		ctx.pushElement(node.nodeName);
		var attrs = node.attributes;
		for (var i = 0, il = attrs.length; i < il; i++) {
			ctx.pushAttribute(attrs[i].name, ctx.evalAVT(attrs[i].value));
		}
		for (let child of node.childNodes) {
			yield child;
		}
		ctx.popElement();
	} else if (node.nodeType === Node.TEXT_NODE) {
		ctx.pushText(node.nodeValue);
	} else if (node.nodeType === Node.ATTRIBUTE_NODE) {
		ctx.pushAttribute(node);
	}
}