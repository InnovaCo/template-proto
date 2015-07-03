/**
 * Стандартные хэндлеры для элементов шаблона
 */
'use strict';

var xpath = require('xpath');

module.exports = {
	/**
	 * Обработка <attribute name="" value=""/>:
	 * добавляет атрибут контекстному сгенерированному элементу
	 */
	'attribute': function*(node, ctx) {
		ctx.pushAttribute(node.getAttribute('name'), node.getAttribute('value'));
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
	}
};