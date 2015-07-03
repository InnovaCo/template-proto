'use srtict';

module.exports = function(arr) {
	arr = arr || [];
	arr.item = item;
	return arr;
};

function item(n) {
	return this[n];
}