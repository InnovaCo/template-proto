/**
 * Высчитывает и заменяет AVT (attribute value templates) внутри строки:
 * "foo {position() + 1}" –> "foo 2"
 */
'use strict';

var xpath = require('xpath');
var stringStream = require('string-stream');
var Node = require('./dom/node');

module.exports = function(str, context) {
	return split(str).map(function(token) {
		if (token.type === 'string') {
			return token.value;
		}

		var result = xpath.select1(token.value, context);
		if (!result) {
			return '';
		}

		if (typeof result === 'object') {
			if (result.nodeType === Node.ELEMENT_NODE) {
				return result.innerText;
			}
			if (result.nodeType === Node.ATTRIBUTE_NODE) {
				return result.value;
			}
			return result.nodeValue;
		}

		return String(result);
	}).join('');
};

function split(data) {
	var out = [];
	var expr = function(e) {
		out.push({type: 'expression', value: e});
	};
	var str = function(s) {
		out.push({type: 'string', value: s});
	};

	var stream = stringStream(data), ch;
	while (!stream.eol()) {
		if (stream.next() === '{') {
			stream.backUp(1);
			str(stream.current());
			stream.start = stream.pos + 1;
			if (stream.skipToPair('{', '}', true)) {
				expr(stream.current(true));
				stream.start = stream.pos;
			} else {
				throw new Error('Invalid expression: ' + str);
			}
		}
	}
	str(stream.current());
	return out.filter(function(token) {
		return token.value;
	});
}