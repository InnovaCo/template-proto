'use strict';

var xpath = require('xpath');
var extend = require('xtend');
var debug = require('debug')('template:template');
var Context = require('./context/dom');
var Document = require('./dom/document');
var Node = require('./dom/node');

var defaultHandlers = extend(require('./handlers'), {
	'template': templateHandler,
	'apply-template': applyTemplateHandler
});

var defaultTemplate = {};
module.exports = class Template {
	constructor(doc) {
		// создаём карту шаблонов: из всех документов получаем имена
		// шаблонов и храним их в порядке добавления
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
		return list ? list[list.length - 1] : null;
	}

	transform(data, handlers) {
		var entryPoint = this._templateMap.get(defaultTemplate);
		if (!entryPoint) {
			throw new Error('No entry point (default template)');
		}
		entryPoint = entryPoint[0];

		var ctx = new Context(extend(defaultHandlers, handlers || {}));
		ctx.template = this;
		ctx.enter(data);
		ctx.transform(entryPoint);

		return ctx.output;
	}
};

function findTemplates(doc) {
	var root = doc.ownerDocument.documentElement;
	var out = [];
	for (var child of root.childNodes) {
		if (child.nodeName === 'template') {
			out.push(child);
		}
	}

	return out;
}

/**
 * Обработка элемента <template>
 */
function* templateHandler(node, ctx) {
	for (var child of node.childNodes) {
		yield child;
	}
}

/**
 * Обработка элемента <apply-template name="" select="">:
 * находим шаблон с указанным именем в списке зарегистрированных и, если есть
 * атрибут select, устанавливаем текущий контекст, равный результату 
 * этого выражения
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

	var ctxExpr = node.getAttribute('select');
	if (ctxExpr) {
		let result = xpath.select(ctxExpr, ctx.context);
		for (var i = 0, il = result.length; i < il; i++) {
			ctx.enter(result[0]);
			yield tmpl;
			ctx.leave();
		}
	} else {
		yield tmpl;
	}
}