'use strict';

var Context = require('./lib/context');
var parseXml = require('./lib/parse-xml').parseFile;

class JSNode {
	constructor(type) {
		this.type = type;
		this.children = null;
		this.attrs = {},
		this.parent = null;
	}

	toJSON() {
		return {
			type: this.type,
			attrs: this.attrs,
			children: Array.isArray(this.children) 
				? this.children.map(function(node) {
					return node.toJSON()
				})
				: this.children
		};
	}
}

class JSContext extends Context {
	constructor() {
		super({}, {ownerDocument: null});
		this.output = new JSNode();
		this.outputCtx = this.output;
		this.registerhandler('script', scriptHandler);
	}

	pushElement(name, attributes) {
		var elem = new JSNode(name);
		if (!Array.isArray(this.outputCtx.children)) {
			this.outputCtx.children = [];
		}
		this.outputCtx.children.push(elem);
		elem.parent = this.outputCtx;
		this.outputCtx = elem;

		if (Array.isArray(attributes)) {
			for (let attr of attributes) {
				this.pushAttribute(attr.name, attr.value);
			}
		} else if (typeof attributes === 'object') {
			for (let name of Object.keys(attributes)) {
				this.pushAttribute(name, attributes[name]);
			}
		}
	}

	pushAttribute(name, value) {
		if (typeof name === 'object') {
			value = name.value;
			name = name.name;
		}
		
		this.outputCtx.attrs[name] = value;
	}

	pushText(value) {
		value = value.trim();
		if (value) {
			this.outputCtx.children = value;
		}
	}

	popElement() {
		if (this.outputCtx.parent) {
			this.outputCtx = this.outputCtx.parent;
		}
	}
};

function* scriptHandler(node, ctx) {
	var scriptContent = ctx.innerText(node).trim();
	var ast = parseJS(scriptContent);
	findelemet(ctx.output);
	extend();
}

var ctx = new JSContext();
ctx.transform(parseXml('./data/model.xml').firstChild);
console.log(JSON.stringify(ctx.output, null, '  '));
