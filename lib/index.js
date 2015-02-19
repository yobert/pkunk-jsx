var recast = require('recast');
var b = recast.types.builders;

var reserved = require('./reserved');
var safe_re = /^[a-z_][a-z0-9_]*$/;

function safe(n) {
	if(safe_re.test(n))
		return !reserved[n];

	return false;
}

var visitor = {
	visitXJSElement: function(e) {

		var open = e.value.openingElement;

		var tagname = open.name.name;
		var props;
		var children;

		if(open.attributes.length > 0) {
			props = b.objectExpression(open.attributes.map(function(prop) {
				var n = prop.name.name;
				return b.property('init', safe(n) ? b.identifier(n) : b.literal(n), prop.value);
			}));
		}

		var args = [
			b.literal(tagname)
		];

		if(!open.selfClosing && e.value.children.length > 0) {
			children = e.value.children.map(function(child) {
				if(child.type != "Literal") {
					return child;
				}

				var v = child.value;

				child = b.literal(v);
				child.raw = '"' + v + '"';

				return child;
			});
		}

		if(props || children) {
			args.push(props || b.identifier("null"));
		}

		if(children) {
			if(children.length == 1) {
				args.push(children[0]);
			}
			else if(children.length > 1) {
				args.push(b.arrayExpression(children));
			}
		}

		var n = b.identifier('tag');
		var x = b.callExpression(n, args);

		return x;
	},

	visitXJSExpressionContainer: function(e) {
		return e.value.expression;
	}
};

module.exports = function (input) {
	var ast = recast.parse(input);
	recast.visit(ast, visitor);
	return recast.print(ast).code;
};

