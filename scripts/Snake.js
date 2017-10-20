"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var createjs = require("easeljs");require("tweenjs");
var traditions = require("./tradition.js").snakes;

var Point = createjs.Point;
var Matrix2D = createjs.Matrix2D;

var Setting = require("./Setting");
var UniqueID = require("./UniqueID");
var SnakeNodeSprite = require("./Sprite").snakenode;
var MapManager = require("./MapManager");
var CrumbManager = require("./CrumbManager");

function Snake(pos, dir, score, color, AI, stage, name, manager) {
	var _id = UniqueID.ID,
	    _bodies = [],
	    _path = [],
	    _dir = dir,
	    //vector
	_aimDir = dir.clone(),
	    //vector
	_tobe = 1,
	    _InitLength = 5,
	    _score = score,
	    _BodyLength = _InitLength + Math.floor(_score / Setting.GROW_SCORE_POINT),
	    _headPos = pos,
	    //vector
	_color = color,
	    _AI = AI,
	    _speed = Setting.INIT_SPEED,
	    _rotateSpeed = Setting.ROTATE_SPEED,
	    _stage = stage,
	    _moveDelta = 0,
	    _clipPathDelta = 0,
	    _normalAIDelta = 0,
	    _normalAIDirDelta = 0,
	    _curSpeedScale = 1,
	    _kill = 0,
	    _radius = 8,
	    _eatRange = 1600,
	    _warnRange = 6400,
	    _warnRangeSqrt = 200,
	    _viewRange = 10000,
	    _isDead = false,
	    _name = name,
	    _textIdx = 0;

	var INTERVAL_PATH_POINT = Setting.INTERVAL_PATH_POINT;
	var ROTATE_SPEED = Setting.ROTATE_SPEED;
	var SNAKE_MOVE_INTERVAL = 30;
	var SNAKE_CLIP_PATH_INTERVAL = 500;
	var PLAYGROUND_WIDTH = Setting.PLAYGROUND_WIDTH;
	var PLAYGROUND_HEIGHT = Setting.PLAYGROUND_HEIGHT;
	var GROW_SCORE_POINT = Setting.GROW_SCORE_POINT;
	var NORMAL_AI_UPDATE_INTERVAL = Setting.NORMAL_AI_UPDATE_INTERVAL;
	var TEXT = traditions[parseInt(traditions.length * Math.random())];

	function init() {
		createBody();
	}

	function createBody() {
		var pathlength = _BodyLength << INTERVAL_PATH_POINT;
		var curbody = 0;
		for (var itr = 0; itr < pathlength; itr++) {
			var pt_new = new Point();
			initNextMemo(itr, pt_new);
			_path.push(pt_new);
			if (curbody << INTERVAL_PATH_POINT === itr) {
				if (curbody == 0) {
					// generateNode(pt_new.x, pt_new.y, _name);
					generateNode(pt_new.x, pt_new.y);
				} else {
					generateNode(pt_new.x, pt_new.y);
				}
				++curbody;
			}
		}
		_radius = _bodies[0].getBounds().width / 2;
	}

	function initNextMemo(itr, pt) {
		var scaler = _speed * itr,
		    transMtx = new Matrix2D(1, 0, 0, 1, -_dir.x * scaler, -_dir.y * scaler);
		transMtx.transformPoint(_headPos.x, _headPos.y, pt);
	}

	function generateNode(x, y, name) {
		var text = name || TEXT[_textIdx++ % TEXT.length];
		var body = new SnakeNodeSprite(_color, text);
		body.x = x;
		body.y = y;
		body.ParentID = _id;
		_stage.addChild(body);
		_bodies.push(body);
		MapManager.AddToABlock(body);
	}

	function Rotate(dt) {
		if (_dir.x != _aimDir.x || _dir.y != _aimDir.y) {
			var dot = _dir.x * _aimDir.x + _dir.y * _aimDir.y;
			var angle = Math.acos(dot) / Math.PI * 180;

			var theta = _rotateSpeed * dt;
			if (Math.abs(angle) <= theta) {
				_dir = _aimDir.clone();
			} else {
				var t = _tobe * theta,
				    transMtx = new Matrix2D();
				transMtx.rotate(t).transformPoint(_dir.x, _dir.y, _dir);
			}
		}
	}

	function nextMemo(itr, pt) {
		var scaler = _speed * itr,
		    transMtx = new Matrix2D(1, 0, 0, 1, _dir.x * scaler, _dir.y * scaler);
		// console.log(scaler);
		transMtx.transformPoint(_headPos.x, _headPos.y, pt);
	}

	function Move(dt) {
		_moveDelta += dt;
		if (_moveDelta > SNAKE_MOVE_INTERVAL) {
			_moveDelta -= SNAKE_MOVE_INTERVAL;
			//console.log(_curSpeedScale);
			for (var i = 1; i <= _curSpeedScale; i++) {
				var pt_new = new Point();
				nextMemo(i, pt_new);
				_path.unshift(pt_new);
			}
			_headPos = _path[0];
			//_bodies[0].setTransform(_headPos.x, _headPos.y);
			MoveBodies();
		}
		_clipPathDelta += dt;
		if (_clipPathDelta >= SNAKE_CLIP_PATH_INTERVAL) {
			_clipPathDelta -= SNAKE_CLIP_PATH_INTERVAL;
			var length = _BodyLength << INTERVAL_PATH_POINT;
			_path.splice(length + 1);
		}
	}

	function MoveBodies() {
		var idx = void 0,
		    pos = void 0,
		    node = void 0;
		for (var i = _bodies.length - 1; i >= 0; i--) {
			idx = Math.min(i << INTERVAL_PATH_POINT, _path.length - 1);
			pos = _path[idx];
			node = _bodies[i];
			MapManager.RefreshBlock(node, pos);
			node.setTransform(pos.x, pos.y);
		}
	}

	function changeSpeedScale(value) {
		if (_curSpeedScale !== value) {
			_curSpeedScale = value;
			//console.log(_curSpeedScale);
		}
	}

	function distance2(a, b) {
		return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
	}

	function checkCrumb() {
		var region = MapManager.getRegion(_headPos);

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = region[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _step$value = _slicedToArray(_step.value, 2),
				    id = _step$value[0],
				    entity = _step$value[1];

				if (entity.name === "CRUMB" || entity.name === "DIE_SNAKE") {
					if (distance2(entity, _headPos) < _eatRange) {
						_score += entity.score;
						CrumbManager.deleteCrumb(entity, _headPos);
						region.delete(id);
					}
				}
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
	}

	function desolve() {
		//console.log(_id + " desolve begin")
		_bodies.forEach(function (item, idx) {

			CrumbManager.addCrumb({
				x: item.x + Math.random() * 10 - 5,
				y: item.y + Math.random() * 10 - 5,
				r: 12,
				color: _color,
				score: 3,
				name: "DIE_SNAKE"
			});
			MapManager.RemoveFromABlock(item);
			_stage.removeChild(item);
		});
		_bodies = null;
		_path = null;
		//console.log(_id + " desolve end")
	}

	function CheckDie() {
		if (_isDead) return true;
		var region = MapManager.getRegion(_headPos);
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = region[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var _step2$value = _slicedToArray(_step2.value, 2),
				    id = _step2$value[0],
				    entity = _step2$value[1];

				if (entity.name === "SNAKE_NODE" && entity.ParentID != _id) {
					var len = distance2(entity, _headPos);
					if (len < Math.pow(_radius << 1, 2)) {
						manager.getSnake(entity.ParentID).kill();
						//console.log(SnakeManager)
						//console.log(CrumbManager);
						desolve();

						_isDead = true;
						return true;
					}
				}
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

		var crush = _headPos.x + _radius > PLAYGROUND_WIDTH || _headPos.x - _radius < 0 || _headPos.y + _radius > PLAYGROUND_HEIGHT || _headPos.y - _radius < 0;
		if (!_isDead && crush) {
			desolve();
		}
		return _isDead = crush;
	}

	function updateLength() {
		var len = _InitLength + Math.floor(_score / GROW_SCORE_POINT);
		if (len > _BodyLength) {
			var pt_new = new Point();
			for (var q = len - _BodyLength, i = 1; i <= q; i++) {
				initNextMemo(i, pt_new);
				generateNode(pt_new.x, pt_new.y);
			}
			_BodyLength = len;
			//console.log(_BodyLength);
		}
	}

	function UpdateNormalAI(dt) {
		_normalAIDelta += dt;
		_normalAIDirDelta -= dt;
		if (_normalAIDelta < NORMAL_AI_UPDATE_INTERVAL) return;

		_normalAIDelta -= NORMAL_AI_UPDATE_INTERVAL;
		// avoid enemy
		var region = MapManager.getRegion(_headPos);
		var force = null,
		    minLength = 0;
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = region[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var _step3$value = _slicedToArray(_step3.value, 2),
				    id = _step3$value[0],
				    entity = _step3$value[1];

				if (entity.name === "SNAKE_NODE" && entity.ParentID != _id) {
					var len = distance2(entity, _headPos);
					if (len < _warnRange && (minLength == 0 || len < minLength)) {
						force = new Point();
						force.x = _headPos.x - entity.x;
						force.y = _headPos.y - entity.y;
						minLength = len;
					}
				}
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}

		if (force !== null) {
			//console.log("avoid enemy", force);
			RotateTo(force);
			return;
		}

		// avoid border
		if (_headPos.x < _warnRangeSqrt || PLAYGROUND_WIDTH - _headPos.x < _warnRangeSqrt) {
			force = new Point();
			force.x = _headPos.x < _warnRangeSqrt ? 1 : -1;
		}
		if (_headPos.y < _warnRangeSqrt || PLAYGROUND_HEIGHT - _headPos.y < _warnRangeSqrt) {
			force = new Point();
			force.y = _headPos.y < _warnRangeSqrt ? 1 : -1;
		}

		if (force !== null) {
			//console.log("avoid border", force);
			RotateTo(force);
			return;
		}

		// find die body
		_curSpeedScale = 1;
		var _iteratorNormalCompletion4 = true;
		var _didIteratorError4 = false;
		var _iteratorError4 = undefined;

		try {
			for (var _iterator4 = region[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
				var _step4$value = _slicedToArray(_step4.value, 2),
				    id = _step4$value[0],
				    entity = _step4$value[1];

				if (entity.name === "DIE_SNAKE") {
					var _len = distance2(entity, _headPos);
					if (_len < _viewRange && (minLength == 0 || _len < minLength)) {
						force = new Point();
						force.x = entity.x - _headPos.x;
						force.y = entity.y - _headPos.y;
						minLength = _len;
					}
				}
			}
		} catch (err) {
			_didIteratorError4 = true;
			_iteratorError4 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion4 && _iterator4.return) {
					_iterator4.return();
				}
			} finally {
				if (_didIteratorError4) {
					throw _iteratorError4;
				}
			}
		}

		if (force !== null) {
			//console.log("find die body", force);
			RotateTo(force);
			_curSpeedScale = 2;
			return;
		}

		// random move
		if (_normalAIDirDelta < 0) {
			//console.log("random move");
			_normalAIDirDelta = Math.random() * 5000;

			var x = Math.random() * 2 - 1 + _dir.x;
			var y = Math.random() * 2 - 1 + _dir.y;

			RotateTo(new Point(x, y));
			return;
		}
	}

	function normalize(vec) {
		var mod = Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
		vec.x /= mod;
		vec.y /= mod;
		return vec;
	}

	function RotateTo(vec) {
		_aimDir = normalize(vec);
		_tobe = _aimDir.y * _dir.x - _aimDir.x * _dir.y >= 0 ? 1 : -1;
		//console.log(_tobe>0);
	}

	init();

	return {
		get ID() {
			return _id;
		},
		update: function update(dt) {
			if (CheckDie()) return;
			if (AI) UpdateNormalAI(dt);
			Rotate(dt);
			Move(dt);
			checkCrumb();
			updateLength();
		},
		setAccelarate: function setAccelarate(value) {
			//	console.log("accelerate:" + value)
			if (value) changeSpeedScale(2);else changeSpeedScale(1);
		},
		RotateTo: function RotateTo(vec) {
			_aimDir = vec;
			_tobe = _aimDir.y * _dir.x - _aimDir.x * _dir.y >= 0 ? 1 : -1;
			//console.log(_tobe>0);
		},
		sentenceDie: function sentenceDie() {
			_isDead = true;
		},
		get Pos() {
			return _headPos;
		},
		kill: function kill() {
			_kill++;
		},

		get Kill() {
			return _kill;
		},
		get Title() {
			return _name;
		},
		get Score() {
			return _score;
		},
		get IsDead() {
			return _isDead;
		}
	};
}

module.exports = Snake;