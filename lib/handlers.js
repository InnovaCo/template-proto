/**
 * Стандартные хэндлеры для элементов шаблона
 */
'use strict';

var xpath = require('xpath');
var utils = require('./utils');
var Node = require('./dom/node');

module.exports = {
	/**
	 * Обработка <attribute name="" value=""/>:
	 * добавляет атрибут контекстному сгенерированному элементу
	 */
	'attribute': function*(node, ctx) {
		var value = '';

		if (node.hasAttribute('value')) {
			value = node.getAttribute('value');
		} else {
			var parent = ctx.outputCtx;
			ctx.outputCtx = parent.ownerDocument.createElement('span');
			for (let child of node.childNodes) {
				yield child;
			}
			value = utils.innerText(ctx.outputCtx);
			ctx.outputCtx = parent;
		}
		ctx.pushAttribute(node.getAttribute('name'), value);
	},

	/**
	 * Обработка <value-of select="..."/>:
	 * по xpath-запросу из атрибута select достаёт результат и, если он есть,
	 * выводит его текстовое содержимое
	 */
	'value-of': function*(node, ctx) {
		var expr = node.getAttribute('select');
		if (expr) {
			var result = xpath.select1(expr, ctx.context);
			if (result != null) {
				ctx.pushText(result);
			}
		}
	},

	/**
	 * Обработка <copy-of select="..."/>:
	 * по xpath-запросу из атрибута select достаёт результат и, если он есть,
	 * копирует его содержимое
	 */
	'copy-of': function*(node, ctx) {
		var expr = node.getAttribute('select');
		if (expr) {
			var result = xpath.select(expr, ctx.context);
			for (let child of result) {
				copyNode(child, ctx);
			}
		}
	},

	/**
	 * Обработка <if test="..."/>:
	 * по xpath-запросу из атрибута test достаёт результат и приводит его к Boolean, 
	 * если результат положительный, то выполняет вложенный шаблон.
	 */
	'if': function*(node, ctx) {
		var expr = node.getAttribute('test');
		if (expr) {
			var result = xpath.select(expr, ctx.context);
			if ((Array.isArray(result) ? result.filter(Boolean).length : result)) {
				for (let child of node.childNodes) {
					yield child;
				}
			}
		}
	}
};

function copyNode(node, ctx) {
	if (node.nodeType === Node.ELEMENT_NODE) {
		ctx.pushElement(node.nodeName, node.attributes);
		for (let child of node.childNodes) {
			copyNode(child, ctx);
		}
		ctx.popElement();
	} else if (node.nodeType === Node.TEXT_NODE) {
		ctx.pushText(node.nodeValue);
	} else if (node.type === Node.ATTRIBUTE_NODE) {
		ctx.pushAttribute(node.name, node.value);
	}
}