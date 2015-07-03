/**
 * Класс для представления текстового узла
 */
'use strict';

var Node = require('./node');

module.exports = class Text extends Node {
	constructor(value) {
		super(Node.TEXT_NODE);
		this.nodeValue = value || '';
	}
};