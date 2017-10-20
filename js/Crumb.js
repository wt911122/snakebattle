const Victor = require("victor");

const Setting = require("./Setting");
const Sprite = require("./Sprite");
const UniqueID = require("./UniqueID");



function Crumb({x, y, color}, stage){
	let _sprite = new Sprite.crumb(color),
		_id = UniqueID.ID,
		_pos = new Victor(x, y);

	_sprite.x = _pos.x;
	_sprite.y = _pos.y;

	stage.addChild(_sprite);
	return {
		get Pos(){
			return _pos;
		},

		get Bounds(){
			return _sprite.getBounds();
		},

		get ID(){
			return _id;
		}
	}
}

module.exports = Crumb;