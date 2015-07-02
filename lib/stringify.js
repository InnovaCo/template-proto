'use strict';

var stringify = module.exports = function(node, indent) {
	indent = indent || '';
	if (node.type === 'text') {
		return `${indent}"${node.nodeValue}"\n`;
	}

	var start = '', end = '', content = '';
	if (node.type === 'document') {
		start = '#document';
	} else if (node.type === 'element') {
		start = '<' + node.nodeName;
		for (let attr of node.attributes) {
			start += ` ${attr.nodeName}="${attr.nodeValue}"`;
		}
		start += '>';
		end = `</${node.nodeName}>`;
	} else {
		throw new TypeError('Unknown element type: ' + node.type);
	}

	if (node.childNodes) {
		let innerIndent = indent + '  ';
		for (let child of node.childNodes) {
			content += stringify(child, innerIndent);
		}
	}

	return indent + start + '\n' + content + indent + end + '\n';
};