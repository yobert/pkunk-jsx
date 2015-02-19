#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var jsx = require('..');
var args = process.argv.splice(2);
args.forEach(function(v) { fs.readFile(v, 'utf8', function (err,data) {
	if (err) {
		throw(err);
	}
	console.log(jsx(data));
});});
