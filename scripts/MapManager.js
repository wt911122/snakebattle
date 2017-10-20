"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("babel-polyfill");
var Setting = require("./Setting");

var MAP_BLOCK_WIDTH = Setting.MAP_BLOCK_WIDTH;

var regions = [],
    stepR = void 0,
    stepC = void 0;

var MapManager = function () {
	function MapManager() {
		_classCallCheck(this, MapManager);

		stepC = Setting.PLAYGROUND_WIDTH >> Setting.MAP_BLOCK_WIDTH;
		stepR = Setting.PLAYGROUND_HEIGHT >> Setting.MAP_BLOCK_WIDTH;

		for (var r = 0; r <= stepR; r++) {
			regions[r] = [];
			for (var c = 0; c <= stepC; c++) {
				regions[r][c] = new Map();
			}
		}
		console.log(stepC, stepR);
	}

	_createClass(MapManager, [{
		key: "AddToABlock",
		value: function AddToABlock(entity) {
			var c = entity.x >> MAP_BLOCK_WIDTH,
			    r = entity.y >> MAP_BLOCK_WIDTH;
			try {
				regions[r][c].set(entity.id, entity);
			} catch (e) {
				console.error(c, r);
			}
		}
	}, {
		key: "RemoveFromABlock",
		value: function RemoveFromABlock(entity) {
			var c = entity.x >> MAP_BLOCK_WIDTH,
			    r = entity.y >> MAP_BLOCK_WIDTH;
			regions[r][c].delete(entity.id);
		}
	}, {
		key: "getRegion",
		value: function getRegion(pos) {
			var c = pos.x >> MAP_BLOCK_WIDTH,
			    r = pos.y >> MAP_BLOCK_WIDTH;
			return regions[r][c];
		}
	}, {
		key: "RefreshBlock",
		value: function RefreshBlock(entity, pos) {
			var cbefore = entity.x >> MAP_BLOCK_WIDTH,
			    rbefore = entity.y >> MAP_BLOCK_WIDTH,
			    cafter = pos.x >> MAP_BLOCK_WIDTH,
			    rafter = pos.y >> MAP_BLOCK_WIDTH;
			if (cbefore !== cafter || rbefore !== rafter) {
				regions[rbefore][cbefore].delete(entity.id);
				regions[rafter][cafter].set(entity.id, entity);
			}
		}
	}, {
		key: "clear",
		value: function clear() {
			for (var r = 0; r <= stepR; r++) {
				regions[r] = [];
				for (var c = 0; c <= stepC; c++) {
					regions[r][c] = new Map();
				}
			}
		}
	}]);

	return MapManager;
}();

module.exports = new MapManager();