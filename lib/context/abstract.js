/**
 * Контекст трансформации дерева: захватывает текущий контекстный элемент
 * и предоставляет интерфейс для вывода данных
 */
'use strict';

var debug = require('debug')('template:context');
var avt = require('../avt');
var Node = require('../dom/node');

module.exports = class AbstractContext {
	constructor(handlers) {
		this._handlers = new Map();
		this._context = [];

		if (handlers) {
			Object.keys(handlers).forEach(function(nodeName) {
				this.registerHandler(nodeName, handlers[nodeName]);
			}, this);
		}
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
		return handler || this.constructor.defaultHandler;
	}

	transform(node) {
		for (var n of transform(node, this)) {
			debug('transforming %s', nodeStr(node));
			continue;
		}
	}

	pushElement(name, attributes) {
		throw new Error('Not implemented');
	}

	pushAttribute(name, value) {
		throw new Error('Not implemented');
	}

	pushText(value) {
		throw new Error('Not implemented');
	}

	popElement() {
		throw new Error('Not implemented');
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

	innerText(node) {
		return innerText(node);
	}
};

module.exports.defaultHandler = defaultHandler;

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

function* transform(node, ctx) {
	var handler = ctx.getHandlerForNode(node);
	for (var next of handler(node, ctx)) {
		yield next;
		yield* transform(next, ctx);
	}
}

function* defaultHandler(node, ctx) {
	ctx = ctx || this;
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

function nodeStr(node) {
	switch (node.nodeType) {
		case Node.DOCUMENT_NODE: return '#document';
		case Node.TEXT_NODE: return `"${node.nodeValue}"`;
		case Node.ELEMENT_NODE: return `<${node.nodeName}>`;
		case Node.ATTRIBUTE_NODE: return `@${node.name}`;
	}
}