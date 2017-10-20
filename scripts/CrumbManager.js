"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var createjs = require("easeljs");require("tweenjs");

var Setting = require("./Setting");
var CrumbSprite = require("./Sprite").crumb;
var Util = require("./Util");
var MapManager = require("./MapManager");

var CRUMB_MAX_NUM = Setting.CRUMB_MAX_NUM;
var PLAYGROUND_WIDTH = Setting.PLAYGROUND_WIDTH;
var PLAYGROUND_HEIGHT = Setting.PLAYGROUND_HEIGHT;
var CRUMB_UPDATE_INTERVAL = 500;
var getRandomColor = Util.getRandomColor;

var crumbs = new Map();
var _parent = void 0;
var _crumbUpdateDelta = 0;

var CrumbManager = function () {
	function CrumbManager() {
		_classCallCheck(this, CrumbManager);
	}

	_createClass(CrumbManager, [{
		key: "init",
		value: function init(parent) {
			_parent = parent;
			//	console.log(stage)
			for (var i = 0; i < CRUMB_MAX_NUM; i++) {
				this.addCrumb({});
			}
		}
	}, {
		key: "addCrumb",
		value: function addCrumb(_ref) {
			var x = _ref.x,
			    y = _ref.y,
			    r = _ref.r,
			    color = _ref.color,
			    score = _ref.score,
			    name = _ref.name;

			//	console.log(x,y,r,color)
			var entity = new CrumbSprite(color || getRandomColor(), r);
			entity.x = x !== undefined ? x : Math.round(Math.random() * (PLAYGROUND_WIDTH - 20)) + 10;
			entity.y = y !== undefined ? y : Math.round(Math.random() * (PLAYGROUND_HEIGHT - 20)) + 10;
			entity.score = score || 1;
			if (name) entity.name = name;
			_parent.addChild(entity);
			crumbs.set(entity.id, entity);
			MapManager.AddToABlock(entity);
		}
	}, {
		key: "deleteCrumb",
		value: function deleteCrumb(entity, pos) {
			createjs.Tween.get(entity).to({ x: pos.x, y: pos.y }, 100).call(function () {
				MapManager.RemoveFromABlock(entity);
				_parent.removeChild(entity);
				crumbs.delete(entity.id);
			});
			//entity.uncache();
		}
	}, {
		key: "update",
		value: function update(dt) {
			_crumbUpdateDelta += dt;
			if (_crumbUpdateDelta > CRUMB_UPDATE_INTERVAL) {
				_crumbUpdateDelta -= CRUMB_UPDATE_INTERVAL;
				//console.log(crumbs.size)
				var span = CRUMB_MAX_NUM - crumbs.size;
				//console.log(`add ${span} crumb`);
				for (; span >= 0; span--) {
					this.addCrumb({});
				}
			}
		}
	}, {
		key: "clear",
		value: function clear() {
			crumbs = new Map();
			_parent = null;
			_crumbUpdateDelta = 0;
		}
	}]);

	return CrumbManager;
}();

module.exports = new CrumbManager();