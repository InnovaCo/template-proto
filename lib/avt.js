/**
 * Высчитывает и заменяет AVT (attribute value templates) внутри строки:
 * "foo {position() + 1}" –> "foo 2"
 */
'use strict';

var xpath = require('xpath');
var StringStream = require('./string-stream');
var utils = require('./utils');

module.exports = function(str, context) {
	return split(str).map(function(token) {
		if (token.type === 'string') {
			return token.value;
		}

		var result = xpath.select1(token.value, context);
		return result ? utils.stringify(result) : '';
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

	var stream = new StringStream(`${data}`), ch;
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
