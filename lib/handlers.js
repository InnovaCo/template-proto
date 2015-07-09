/**
 * Стандартные хэндлеры для элементов шаблона
 */
'use strict';

var xpath = require('xpath');
var utils = require('./utils');

module.exports = {
	/**
	 * Обработка <attribute name="" value=""/>:
	 * добавляет атрибут контекстному сгенерированному элементу
	 */
	'attribute': function*(node, ctx) {
		node.parent = ctx.outputCtx;
		ctx.outputCtx = node;
		for (let child of node.childNodes) {
			yield child;
		}
		ctx.outputCtx = node.parent;
		ctx.pushAttribute(node.getAttribute('name'), node.getAttribute('value') || utils.stringify(node));
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
			var result = xpath.select1(expr, ctx.context);
			if (result != null) {
				for (let child of result.childNodes) {
					yield child;
				}
				node.parentNode.removeChild(node);
			}
		}
	}
};