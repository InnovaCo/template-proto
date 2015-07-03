'use strict';

var xpath = require('xpath');
var transformer = require('./transform');
var Context = require('./context');
var Document = require('./dom/document');
var Node = require('./dom/node');
var debug = require('debug')('template:template');

var defaultTemplate = {};
module.exports = class Template {
	constructor(doc) {
		// создаём карту шаблонов
		var templateMap = this._templateMap = new Map();
		var docs = Array.isArray(doc) ? doc : [doc];
		docs.forEach(function(doc) {
			findTemplates(doc).forEach(function(template) {
				var name = template.getAttribute('name') || defaultTemplate;
				var list = templateMap.get(name);
				if (!list) {
					list = [template];
				} else {
					list.push(template);
				}
				templateMap.set(name, list);
			});
		});
	}

	getByName(name) {
		var list = this._templateMap.get(name);
		return list ? list[0] : null;
	}

	transform(data, handlers) {
		var entryPoint = this._templateMap.get(defaultTemplate);
		if (!entryPoint) {
			throw new Error('No entry point (default template)');
		}
		entryPoint = entryPoint[0];

		var ctx = new Context(data, new Document(), handlers);
		ctx.template = this;
		ctx.registerHandler('template', templateHandler);
		ctx.registerHandler('apply-template', applyTemplateHandler);

		for (var node of transformer.transform(entryPoint, ctx)) {
			debug('transforming %s', nodeStr(node));
			continue;
		}

		return ctx.output;
	}
};

function findTemplates(doc) {
	var root = doc.ownerDocument.documentElement;
	var children = root.childNodes;
	var out = [];

	for (var i = 0, il = children.length; i < il; i++) {
		if (children[i].nodeName === 'template') {
			out.push(children[i]);
		}
	}
	return out;
}

function* templateHandler(node, ctx) {
	for (var child of node.childNodes) {
		yield child;
	}
}

/**
 * Вызов указанного шаблона с передачей контекста
 */
function* applyTemplateHandler(node, ctx) {
	debug('apply template');
	var tmplName = node.getAttribute('name');
	if (!tmplName) {
		debug('no template name, aborting');
		return;
	}

	var tmpl = ctx.template.getByName(tmplName);
	if (!tmpl) {
		debug('no template for name %s, aborting', tmplName);
	}

	var ctxNode;
	var ctxExpr = node.getAttribute('select');
	if (ctxExpr) {
		ctxNode = xpath.select1(ctxExpr, ctx.context);
		if (!ctxExpr) {
			debug('no matching context element for selector %s, aborting', ctxExpr);
			return;
		}
	}

	ctxNode && ctx.enter(ctxNode);
	yield tmpl;
	ctxNode && ctx.leave();
}

function nodeStr(node) {
	switch (node.nodeType) {
		case Node.DOCUMENT_NODE: return '#document';
		case Node.TEXT_NODE: return `"${node.nodeValue}"`;
		case Node.ELEMENT_NODE: return `<${node.nodeName}>`;
		case Node.ATTRIBUTE_NODE: return `@${node.name}`;
	}
}