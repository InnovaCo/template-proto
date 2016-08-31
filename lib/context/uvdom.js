'use strict';

const AbstractContext = require('./abstract');
const tags = require('../../tags');
const attributes = require('../../attributes');

const eventNameRegex = /^on([a-z]+)$/;
const domTagNameRegex = /^([a-z]+:)?(h[1-6]|[a-z]+)$/;

module.exports = class UVDOMContext extends AbstractContext {
	constructor() {
		super();
		this.outputCtx = this.output = new UVDOMNode();
	}

	pushElement(name) {
		var element = new UVDOMNode(name, this.outputCtx);

		this.outputCtx.appendChild(element);
		this.outputCtx = element;
	}

	pushAttribute(name, value) {
		this.outputCtx.pushAttribute(name, value);
	}

	pushText(value) {
		this.outputCtx.pushText(value);
	}

	popElement() {
		if (this.outputCtx.parent) {
			this.outputCtx = this.outputCtx.parent;
		}
	}
};

class UVDOMNode {
	constructor(type, parent) {
		this.parent = parent;

		this.type = type || 'span';
		this.ref = null;
		this.key = null;
		this.attrs = null;
		this.events = null;
		this.children = null;

		this.shadowRoot = null;
		this.shadowRootId = null;
	}

	appendChild(node) {
		if (this.shadowRoot && this.shadowRoot !== node) {
			return this.shadowRoot.appendChild(node);
		}
		Array.isArray(this.children) || (this.children = [].concat(this.children || []));
		this.children.push(node);
	}

	pushAttribute(name, value) {
		name = htmlAttrToUvdomAttr(name);

		if (eventNameRegex.test(name)) {
			return this.pushEvent(name, value);
		} else if (name === 'style') {
			name = 'cssText';
		} else if (~['key', 'ref'].indexOf(name)) {
			return this[name] = value;
		}
		this.attrs || (this.attrs = {});
		this.attrs[name] = value;
	}

	pushEvent(name, handler) {
		var match = name.match(eventNameRegex);

		if (match) {
			this.events || (this.events = {});
			this.events[match[1]] = handler;
		}
	}

	pushText(value) {
		value = `${value}`.replace(/[\n\t]/g, '');

		if (value) {
			if (this.children == null) {
				this.children = value;
			} else {
				this.appendChild(value);
			}
		}
	}

	getShadowRoot() {
		return this.shadowRootId;
	}

	createShadowRoot(id) {
		if (this.shadowRootId) {
			throw new Error('Node already has shadow root');
		}
		this.shadowRootId = id;

		this.shadowRoot = new UVDOMNode('span', this);
		this.shadowRoot.pushAttribute('data-shadow-root-id', this.shadowRootId);
		this.shadowRoot.children = this.children;

		this.children = null;
		this.appendChild(this.shadowRoot);

		return this.shadowRoot;
	}

	toJSON() {
		var type = this.type;
		var result = {
			children: Array.isArray(this.children) ? this.children.map((node) => {
				if (typeof(node) === 'string') {
					return node;
				}
				return node.toJSON();
			}) : this.children
		};

		if (isCommonElement(type)) {
			result.tag = type;
		} else {
			result.component = type;
		}

		this.ref && (result.ref = this.ref);
		this.key && (result.key = this.key);
		this.attrs && (result.attrs = this.attrs);
		this.events && (result.events = this.events);

		return result;
	}
};

module.exports.UVDOMNode = UVDOMNode;

function isCommonElement(tagName) {
    tagName = tagName || '';
	return domTagNameRegex.test(tagName) && (tagName.indexOf(':') > 0 || !!~tags.html.indexOf(tagName) || !!~tags.svg.indexOf(tagName));
}

function htmlAttrToUvdomAttr(name) {
	if (~name.indexOf('-') && !/^data-.+$/.test(name) && attributes.noTransform.indexOf(name) < 0) {
		name = name.split('-').map((part, i) => !i ? part : capitalize(part)).join('');
	}
	return attributes.mapping[name] || name;
}

function capitalize(word) {
	word = '' + word;
	return word.charAt(0).toUpperCase() + word.slice(1);
}
