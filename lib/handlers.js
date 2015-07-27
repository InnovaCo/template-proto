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
	 * Обработка <if test="..."></if>:
	 * по xpath-запросу из атрибута test достаёт результат и приводит его к Boolean, 
	 * если результат положительный, то выполняет вложенный шаблон.
	 */
	'if': function*(node, ctx) {
		var expr = node.getAttribute('test');
		var success = false;
		if (expr) {
			var result = xpath.select(expr, ctx.context);
			if ((Array.isArray(result) ? result.filter(Boolean).length : result)) {
				success = true;
				for (let child of node.childNodes) {
					yield child;
				}
			}
		}
		return success;
	},

	/**
	 * Обработка <for-each select="..."></for-each>:
	 * по xpath-запросу из атрибута select достаёт результат и обрабатывает каждую ноду одинаковым 
	 * путем.
	 */
	'for-each': function*(node, ctx) {
		var expr = node.getAttribute('select');
		if (expr) {
			var result = [].concat(xpath.select(expr, ctx.context) || []).filter(Boolean);
			for (var i = 0, il = result.length; i < il; i++) {
				ctx.enter(result[i]);
				for (let child of node.childNodes) {
					yield child;
				}
				ctx.leave();
			}
		}
	},

	/**
	 * Обработка <text></text>:
	 * пишет в выходное дерево строковое содержимое с эскейпом ключевых сущностей.
	 */
	'text': function*(node, ctx) {
		var value = node.innerHTML;
		var escapeEntities = node.getAttribute('disable-output-escaping') !== 'yes';

		if (!escapeEntities) {
			console.warn(`"disable-output-escaping" attribute is not supported for <text> element`);
		}
		ctx.pushText(value);
	},

	/**
	 * Обработка <choose><when test="..."></when><otherwise></otherwise></choose>:
	 * по примеру switch-конструкции обрабатывает вложенные условия.
	 */
	'choose': function*(node, ctx) {
		var statementNodes = xpath.select('*[self::when or self::otherwise]', node);
		var check = ctx._handlers.get('if');

		for (let statement of statementNodes) {
			if (statement.nodeName === 'when') {
				if (yield* check(statement, ctx)) {
					break;
				}
			} else {
				for (let child of statement.childNodes) {
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