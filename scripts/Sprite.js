"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var createjs = require("easeljs");require("tweenjs");
var traditions = require("./tradition.js").crumbs;

var sprite = {};

var Map = function (_createjs$Container) {
	_inherits(Map, _createjs$Container);

	function Map() {
		var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
		    x = _ref.x,
		    y = _ref.y,
		    width = _ref.width,
		    height = _ref.height;

		_classCallCheck(this, Map);

		var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this));

		var rect = new createjs.Shape(),
		    step = 40,
		    w = width,
		    h = height,
		    gr = rect.graphics;

		gr.beginStroke('#ddd');
		for (var i = step; i < w; i += step) {
			gr.moveTo(i, 0);
			gr.lineTo(i, h);
		}
		for (var _i = step; _i < h; _i += step) {
			gr.moveTo(0, _i);
			gr.lineTo(w, _i);
		}
		gr.endStroke();

		gr.beginStroke("#000");
		gr.setStrokeStyle(4);
		gr.drawRect(0, 0, w, h);
		gr.endStroke();

		_this.name = "MAP";
		_this.x = x;
		_this.y = y;
		_this.addChild(rect);
		return _this;
	}

	return Map;
}(createjs.Container);

var Crumb = function (_createjs$Container2) {
	_inherits(Crumb, _createjs$Container2);

	function Crumb(color, radius) {
		_classCallCheck(this, Crumb);

		var _this2 = _possibleConstructorReturn(this, (Crumb.__proto__ || Object.getPrototypeOf(Crumb)).call(this));

		_this2.foreGround = color;
		_this2.foreradius = radius;
		_this2.drawBody();
		_this2.name = "CRUMB";
		_this2.text = traditions[parseInt(traditions.length * Math.random())];
		_this2.drawText();
		return _this2;
	}

	_createClass(Crumb, [{
		key: "drawBody",
		value: function drawBody() {
			var circle = new createjs.Shape();
			var color = this.foreGround;
			circle.graphics.beginFill(color).drawCircle(0, 0, this.foreradius || 6).endFill();
			circle.x = 0;
			circle.y = 0;
			this.addChild(circle);
			this.setBounds(-6, -6, 12, 12);
		}
	}, {
		key: "drawText",
		value: function drawText() {
			var text = new createjs.Text(this.text, "24px Arial", "#ff7700");
			text.x = -text.getMeasuredWidth() / 2;
			text.y = -28;
			text.textBaseline = "alphabetic";
			this.addChild(text);
		}
	}, {
		key: "setForeGround",
		value: function setForeGround(color) {
			this.foreGround = color;
			this.removeAllChildren();
			this.drawBody();
		}
	}]);

	return Crumb;
}(createjs.Container);

var SnakeNode = function (_createjs$Container3) {
	_inherits(SnakeNode, _createjs$Container3);

	function SnakeNode(color, user) {
		_classCallCheck(this, SnakeNode);

		var _this3 = _possibleConstructorReturn(this, (SnakeNode.__proto__ || Object.getPrototypeOf(SnakeNode)).call(this));

		_this3.foreGround = color;
		_this3.drawBody();
		if (user) _this3.drawName(user);
		_this3.name = "SNAKE_NODE";
		return _this3;
	}

	_createClass(SnakeNode, [{
		key: "drawBody",
		value: function drawBody() {
			var circle = new createjs.Shape();
			var color = this.foreGround;
			circle.graphics.beginFill(color).drawCircle(0, 0, 20).endFill();

			this.addChild(circle);
			this.setBounds(-20, -20, 40, 40);
		}
	}, {
		key: "drawName",
		value: function drawName(user) {
			var text = new createjs.Text(user, "32px Arial", "#ff7700");
			text.x = -text.getMeasuredWidth() / 2;
			text.y = -28;
			text.textBaseline = "alphabetic";
			this.addChild(text);
		}
	}, {
		key: "setForeGround",
		value: function setForeGround(color) {
			this.foreGround = color;
			this.removeAllChildren();
			this.drawBody();
		}
	}]);

	return SnakeNode;
}(createjs.Container);

sprite.map = Map;
sprite.crumb = Crumb;
sprite.snakenode = SnakeNode;
module.exports = sprite;