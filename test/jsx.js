var expect = require('chai').expect;
var recast = require('recast');
var util = require('util');

var jsx = require('..');

var whitespace_re = /[\r\n\t ]+/gm;

describe('pkunk-jsx', function() {

	function x(a, b) {
		expect(jsx(a)).to.eql(b);
	}
	function w(a, b) {
		expect(jsx(a).replace(whitespace_re, " ")).to.eql(b.replace(whitespace_re, " "));
	}

	it('should leave js alone', function() {
		w("function f(a) { return a; }", "function f(a) { return a; }");
	});

	it('should xform simple tags', function() {
		w('<div></div>', 'tag("div")');
	});

	it('should xform self closing tags', function() {
		w('<div />', 'tag("div")');
	});

	it('should xform tags with props', function() {
		w('<div class="header" id="thing"></div>', 'tag("div", { "class": "header", id: "thing" })');
	});

	it('should xform self closing tags with props', function() {
		w('<x prop="1" />', 'tag("x", { prop: "1" })');
	});

	it('should xform tags with children', function() {
		w('<X prop="2"><Y /></X>', 'tag("X", { prop: "2" }, tag("Y"))');
		w('<X prop="2"><Y /><Z /></X>', 'tag("X", { prop: "2" }, [tag("Y"), tag("Z")])');
	});

	it('should xform tags with literals', function() {
		x('<X>abc</X>', 'tag("X", null, "abc")');
		x('<X>  </X>', 'tag("X", null, "  ")');
		x('<X>\n</X>', 'tag("X", null, "\\n")');
		x('<X>\t</X>', 'tag("X", null, "\\t")');
		x('<X>\t\t\t</X>', 'tag("X", null, "\\t\\t\\t")');
		x('<X>a	a	a</X>', 'tag("X", null, "a\\ta\\ta")');
		x('<X>a\ta\ta</X>', 'tag("X", null, "a\\ta\\ta")');
		x('<X>\n string\n</X>', 'tag("X", null, "\\n string\\n")');
		x('<X>\n string\n string\n  </X>', 'tag("X", null, "\\n string\\n string\\n  ")');
	});

	it('should xform expressions', function() {
		w('<X>{a}</X>', 'tag("X", null, a)');
		w('<X>{a} {b}</X>', 'tag("X", null, [a, " ", b])');
		w('<X prop={a}></X>', 'tag("X", { prop: a })');
	});

	it('should xform everything', function() {
		var code = '<X prop={x ? <Y prop={2} /> : <Z>\n</Z>}></X>';


		// ok not sure if this is 100% safe.
		//var result = 'tag("X", { prop: (x ? tag("Y", { prop: 2 }) : tag("Z", null, "\\n")) })';
		var result = 'tag("X", { prop: x ? tag("Y", { prop: 2 }) : tag("Z", null, "\\n") })';

		w(code, result);
	});

});
