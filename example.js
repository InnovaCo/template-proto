'use strict';

const TemplateContext = require('./lib/context/template');
const UVDOMContext = require('./lib/context/uvdom');
const parseXml = require('./lib/parse-xml').parseFile;

var templateXml = parseXml('./data/template.xml');
var modelXml = parseXml('./data/model.xml');

var template = new TemplateContext(templateXml);
var result = template.transform(modelXml);

console.log(result.innerHTML);

var uvdom = new UVDOMContext();
uvdom.transform(modelXml);
console.log(uvdom.output.toJSON());
