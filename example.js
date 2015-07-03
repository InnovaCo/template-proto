'use strict';

var Template = require('./lib/template');
var parseXml = require('./lib/parse-xml').parseFile;

var templateXml = parseXml('./data/template.xml');
var modelXml = parseXml('./data/model.xml');

var template = new Template(templateXml);
var result = template.transform(modelXml);

console.log(result.innerHTML);