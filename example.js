'use strict';

var TemplateContext = require('./lib/context/template');
var parseXml = require('./lib/parse-xml').parseFile;

var templateXml = parseXml('./data/template.xml');
var modelXml = parseXml('./data/model.xml');

var template = new TemplateContext(templateXml);
var result = template.transform(modelXml);

console.log(result.innerHTML);