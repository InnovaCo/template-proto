/**
 * Преобразует указанное дерево в другое: на каждый найденный элемент вызывает
 * вызывает функцию, которая возвращает в контекст новый элемент
 */
'use strict';

var debug = require('debug')('template:transform');
var Context = require('./context');
var Document = require('./dom/document');

module.exports = function(data, template, handlers) {
	var ctx = new Context(data, new Document(), handlers);
	ctx.transform();
	for (var node of transform(template, ctx)) {
		debug('transforming %s', nodeStr(node));
		continue;
	}

	return ctx.output;
}