'use strict';
var xpath = require('xpath');
var parseXml = require('./lib/parse-xml').parseFile;

var model = parseXml('./data/model.xml');

console.log(xpath.select('/model/p2[@title="test"]/preceding-sibling::p1', model).length);
console.log(xpath.select('@title', model.getElementsByTagName('p2')[0]));