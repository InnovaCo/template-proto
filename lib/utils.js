'use strict';

var Node = require('./dom/node');

module.exports = {
	stringify(obj) {
		if (typeof obj === 'object' && 'nodeType' in obj) {
			if (obj.nodeType === Node.ELEMENT_NODE) {
				return innerText(obj);
			}

			if (obj.nodeType === Node.ATTRIBUTE_NODE) {
				return obj.value;
			}

			return 'nodeValue' in obj ? obj.nodeValue : '';
		}

		return String(obj);
	},

	innerText(node) {
		return innerText(node);
	}
};

function innerText(node) {
	if ('innerText' in node) {
		return node.innerText;
	}

	if (node.nodeType === Node.TEXT_NODE) {
		return node.nodeValue;
	}

	return node.childNodes.map(function(node) {
		if (node.nodeType === Node.TEXT_NODE) {
			return node.nodeValue;
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			return innerText(node);
		}
		return '';
	}).join('');
}