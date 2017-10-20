"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("babel-polyfill");
var createjs = require("easeljs");require("tweenjs");
var Setting = require("./Setting");
var Util = require("./Util");
var MapManager = require("./MapManager");
var Snake = require("./Snake");
var ListManager = require("./ListManager");
var names = require("./name.js");

var getRandomColor = Util.getRandomColor;
var Point = createjs.Point;

var SNAKE_MAX_NUM = Setting.ENEMY_SNAKE + 1;
var SNAKE_UPDATE_INTERVAL = 500;
var PLAYGROUND_WIDTH = Setting.PLAYGROUND_WIDTH;
var PLAYGROUND_HEIGHT = Setting.PLAYGROUND_HEIGHT;

var _snakes = new Map();
var _parent = void 0,
    _player = void 0,
    _snakeCheckDelta = 0;

var SnakeManager = function () {
	function SnakeManager() {
		_classCallCheck(this, SnakeManager);
	}

	_createClass(SnakeManager, [{
		key: "init",
		value: function init(parent) {
			var angle = Math.random() * Math.PI * 2;

			_parent = parent;
			_player = this.createSnake(new Point(Setting.PLAYGROUND_WIDTH / 2, Setting.PLAYGROUND_HEIGHT / 2), new Point(Math.cos(angle), Math.sin(angle)), Setting.PLAYER_INIT_LENGTH, getRandomColor(), false, _parent, "player", this);
			var np = Math.floor(Math.random() * (names.length - Setting.ENEMY_SNAKE - 1)),
			    inp = np;
			for (var i = 0; i < Setting.ENEMY_SNAKE; i++) {
				angle = Math.random() * Math.PI * 2;
				var s = this.createSnake(new Point(Math.random() * (Setting.PLAYGROUND_WIDTH - 600) + 300, Math.random() * (Setting.PLAYGROUND_HEIGHT - 600) + 300), new Point(Math.cos(angle), Math.sin(angle)), Math.floor(Math.random() * 50), getRandomColor(), true, _parent, names[inp++], this);
			}
			names.splice(np, Setting.ENEMY_SNAKE);
			//console.log(_snakes);
			return _player;
		}
	}, {
		key: "getSnake",
		value: function getSnake(id) {
			return _snakes.get(id);
		}
	}, {
		key: "createSnake",
		value: function createSnake(pos, dir, length, color, AI, stage) {
			var entity = Snake.apply(Snake, Array.prototype.slice.call(arguments));
			_snakes.set(entity.ID, entity);
			return entity;
		}
	}, {
		key: "generateList",
		value: function generateList() {
			var list = [];
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = _snakes.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var entity = _step.value;

					list.push({
						name: entity.Title,
						score: entity.Score
					});
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			list.sort(function (a, b) {
				return b.score - a.score;
			});
			return list;
		}
	}, {
		key: "update",
		value: function update(dt, overCallback, context) {
			if (_player.IsDead) overCallback.call(context, _player.Score, _player.Kill);
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = _snakes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var _step2$value = _slicedToArray(_step2.value, 2),
					    id = _step2$value[0],
					    entity = _step2$value[1];

					if (entity.IsDead && id !== _player.id) {
						_snakes.delete(id);
						names.push(entity.Title);
						ListManager(this.generateList());
					}
					entity.update(dt);
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			_snakeCheckDelta += dt;
			if (_snakeCheckDelta > SNAKE_UPDATE_INTERVAL) {
				_snakeCheckDelta -= SNAKE_UPDATE_INTERVAL;
				var need = SNAKE_MAX_NUM - _snakes.size;
				//console.log(`create ${need} snakes`);
				for (var i = 0; i < need; i++) {
					var tidx = Math.floor(Math.random() * (names.length - 1));
					var angle = Math.random() * Math.PI * 2;
					var s = this.createSnake(new Point(Math.random() * (PLAYGROUND_WIDTH - 600) + 300, Math.random() * (PLAYGROUND_HEIGHT - 600) + 300), new Point(Math.cos(angle), Math.sin(angle)), Math.floor(Math.random() * 24), getRandomColor(), true, _parent, names[tidx], this);
					names.splice(tidx, 1);
				}

				ListManager(this.generateList());
			}
		}
	}, {
		key: "clear",
		value: function clear() {
			_snakes = new Map();
			_player = null;
			_parent = null;
			_snakeCheckDelta = 0;
			names = require("./name.js");
		}
	}]);

	return SnakeManager;
}();

module.exports = new SnakeManager();