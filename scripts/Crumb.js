"use strict";

var Victor = require("victor");

var Setting = require("./Setting");
var Sprite = require("./Sprite");
var UniqueID = require("./UniqueID");

function Crumb(_ref, stage) {
	var x = _ref.x,
	    y = _ref.y,
	    color = _ref.color;

	var _sprite = new Sprite.crumb(color),
	    _id = UniqueID.ID,
	    _pos = new Victor(x, y);

	_sprite.x = _pos.x;
	_sprite.y = _pos.y;

	stage.addChild(_sprite);
	return {
		get Pos() {
			return _pos;
		},

		get Bounds() {
			return _sprite.getBounds();
		},

		get ID() {
			return _id;
		}
	};
}

module.exports = Crumb;