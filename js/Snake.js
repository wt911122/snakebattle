"use strict";
const createjs = require("easeljs");require("tweenjs");
const traditions = require("./tradition.js").snakes;

const Point = createjs.Point;
const Matrix2D = createjs.Matrix2D;

const Setting = require("./Setting");
const UniqueID = require("./UniqueID");
const SnakeNodeSprite = require("./Sprite").snakenode;
const MapManager = require("./MapManager");
const CrumbManager = require("./CrumbManager");



function Snake(pos, dir, score, color, AI, stage, name, manager){
	let _id = 				UniqueID.ID,
		_bodies = 			[],
 		_path =				[],
		_dir = 				dir, 				//vector
		_aimDir = 			dir.clone(),		//vector
		_tobe =             1,
		_InitLength = 		5,
		_score =   			score,
		_BodyLength = 		_InitLength + Math.floor(_score/Setting.GROW_SCORE_POINT),
		_headPos = 			pos, 				//vector
		_color = 			color,
		_AI = 				AI,
		_speed =        	Setting.INIT_SPEED,
		_rotateSpeed =      Setting.ROTATE_SPEED,
		_stage =        	stage,
		_moveDelta =    	0,
		_clipPathDelta =	0,
		_normalAIDelta =    0,
		_normalAIDirDelta = 0,
		_curSpeedScale =	1,		
		_kill =             0,
		_radius =           8,
		_eatRange =         1600,
		_warnRange =        6400,
		_warnRangeSqrt =    200,
		_viewRange =        10000,
		_isDead =           false,
		_name =             name,
		_textIdx =          0;
		
	const INTERVAL_PATH_POINT = Setting.INTERVAL_PATH_POINT;
	const ROTATE_SPEED = Setting.ROTATE_SPEED;
	const SNAKE_MOVE_INTERVAL = 30;
	const SNAKE_CLIP_PATH_INTERVAL = 500;
	const PLAYGROUND_WIDTH = Setting.PLAYGROUND_WIDTH;
	const PLAYGROUND_HEIGHT = Setting.PLAYGROUND_HEIGHT;
	const GROW_SCORE_POINT = Setting.GROW_SCORE_POINT;
	const NORMAL_AI_UPDATE_INTERVAL = Setting.NORMAL_AI_UPDATE_INTERVAL;
	const TEXT = traditions[parseInt(traditions.length * Math.random())];

	function init(){
		createBody();
	}

	function createBody(){
		let pathlength = _BodyLength << INTERVAL_PATH_POINT;
		let curbody = 0;
		for(let itr = 0; itr < pathlength; itr++){
			let	pt_new = new Point();
			initNextMemo(itr, pt_new)
			_path.push(pt_new);
			if(curbody << INTERVAL_PATH_POINT === itr){
				if(curbody==0){
					// generateNode(pt_new.x, pt_new.y, _name);
					generateNode(pt_new.x, pt_new.y);
				}else{
					generateNode(pt_new.x, pt_new.y);
				}
				++curbody;
			}
		}
		_radius = _bodies[0].getBounds().width/2;
	}

	function initNextMemo(itr, pt){
		let scaler = _speed * itr,
		 	transMtx = new Matrix2D(1, 0, 0, 1, -_dir.x * scaler,-_dir.y * scaler);
		transMtx.transformPoint(_headPos.x, _headPos.y, pt);
	}

	function generateNode(x, y, name){
		const text = name || TEXT[_textIdx++%TEXT.length];
		let body = new SnakeNodeSprite(_color, text);
		body.x = x;
		body.y = y;
		body.ParentID = _id;
		_stage.addChild(body);
		_bodies.push(body);
		MapManager.AddToABlock(body);
	}

	function Rotate(dt) {
		if(_dir.x != _aimDir.x || _dir.y != _aimDir.y){
			let dot = _dir.x*_aimDir.x + _dir.y*_aimDir.y;
			let angle = Math.acos(dot)/ Math.PI* 180;
			
			let theta = _rotateSpeed * dt;
			if(Math.abs(angle) <= theta){
				_dir = _aimDir.clone();
			}else{
				let t = _tobe * theta,
				 	transMtx = new Matrix2D();
				transMtx.rotate(t)
					.transformPoint(_dir.x, _dir.y, _dir);
			}
		}
	}

	function nextMemo(itr, pt){
		let scaler = _speed * itr,
		 	transMtx = new Matrix2D(1, 0, 0, 1, _dir.x * scaler, _dir.y * scaler);
		// console.log(scaler);
		transMtx.transformPoint(_headPos.x, _headPos.y, pt);
	}

	function Move(dt){
		_moveDelta += dt;
		if(_moveDelta > SNAKE_MOVE_INTERVAL){
			_moveDelta -= SNAKE_MOVE_INTERVAL;
			//console.log(_curSpeedScale);
			for(let i = 1; i <= _curSpeedScale; i++){
				let	pt_new = new Point();
				nextMemo(i, pt_new)
				_path.unshift(pt_new);
			}
			_headPos = _path[0];
			//_bodies[0].setTransform(_headPos.x, _headPos.y);
			MoveBodies();
		}
		_clipPathDelta += dt;
		if(_clipPathDelta >= SNAKE_CLIP_PATH_INTERVAL){
			_clipPathDelta -= SNAKE_CLIP_PATH_INTERVAL;
			let length = _BodyLength << INTERVAL_PATH_POINT
			_path.splice(length+1);
		}
	}

	function MoveBodies(){
		let idx, pos, node;
		for(let i = _bodies.length-1; i >= 0; i--) {
			idx = Math.min(i<<INTERVAL_PATH_POINT, _path.length-1);
			pos = _path[idx];
			node = _bodies[i];
			MapManager.RefreshBlock(node, pos);
			node.setTransform(pos.x, pos.y);
		}
	}

	function changeSpeedScale(value){
		if(_curSpeedScale !== value){
			_curSpeedScale = value;
			//console.log(_curSpeedScale);
		}
	}

	function distance2(a, b) {
		return Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2);
	}

	function checkCrumb(){
		let region = MapManager.getRegion(_headPos);

		for (let [id, entity] of region) {
		  	if(entity.name === "CRUMB" || entity.name === "DIE_SNAKE"){
		  		if(distance2(entity, _headPos) < _eatRange){
		  			_score += entity.score;
		  			CrumbManager.deleteCrumb(entity, _headPos);
		  			region.delete(id);
		  		}
		  	}
		}
	}

	function desolve(){
		//console.log(_id + " desolve begin")
		_bodies.forEach((item, idx)=>{

			CrumbManager.addCrumb({
				x: item.x + Math.random()*10 - 5, 
				y: item.y + Math.random()*10 - 5,
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

	function CheckDie(){
		if(_isDead) return true;
		let region = MapManager.getRegion(_headPos);
		for (let [id, entity] of region) {
		  	if(entity.name === "SNAKE_NODE" && entity.ParentID != _id){
		  		let len = distance2(entity, _headPos);
		  		if(len < Math.pow(_radius<<1, 2)){
		  			manager.getSnake(entity.ParentID).kill();
		  			//console.log(SnakeManager)
		  			//console.log(CrumbManager);
		  			desolve();

		  			_isDead = true;
		  			return true;
		  		}
		  	}
		}


		let crush = _headPos.x + _radius > PLAYGROUND_WIDTH 
			|| _headPos.x - _radius < 0 
			|| _headPos.y + _radius> PLAYGROUND_HEIGHT 
			|| _headPos.y - _radius < 0;
		if(!_isDead && crush){
			desolve();
		}
		return _isDead = crush;
	}

	function updateLength(){
		let len = _InitLength + Math.floor(_score / GROW_SCORE_POINT);
		if(len > _BodyLength){
			let pt_new = new Point();
			for(let q = len - _BodyLength, i = 1; i <= q; i++){
				initNextMemo(i, pt_new)
				generateNode(pt_new.x, pt_new.y);
			}
			_BodyLength = len;
			//console.log(_BodyLength);
		}
	}

	function UpdateNormalAI(dt){
		_normalAIDelta += dt
		_normalAIDirDelta -= dt;
		if(_normalAIDelta < NORMAL_AI_UPDATE_INTERVAL)
			return;

		_normalAIDelta -= NORMAL_AI_UPDATE_INTERVAL;
		// avoid enemy
		let region = MapManager.getRegion(_headPos);
		let force = null,
			minLength = 0;
		for (let [id, entity] of region) {
		  	if(entity.name === "SNAKE_NODE" && entity.ParentID != _id){
		  		let len = distance2(entity, _headPos);
		  		if(len < _warnRange && (minLength == 0 || len < minLength)){
		  			force = new Point();
		  			force.x = _headPos.x - entity.x;
		  			force.y = _headPos.y - entity.y;
		  			minLength = len;
		  		}
		  	}
		}

		if(force !== null){
			//console.log("avoid enemy", force);
			RotateTo(force);
			return;
		}

		// avoid border
		if(_headPos.x < _warnRangeSqrt || PLAYGROUND_WIDTH - _headPos.x < _warnRangeSqrt){
			force = new Point();
			force.x = _headPos.x < _warnRangeSqrt ? 1: -1;
		}
		if(_headPos.y < _warnRangeSqrt || PLAYGROUND_HEIGHT - _headPos.y < _warnRangeSqrt){
			force = new Point();
			force.y = _headPos.y < _warnRangeSqrt ? 1: -1;
		}

		if(force !== null){
			//console.log("avoid border", force);
			RotateTo(force);
			return;
		}

		// find die body
		_curSpeedScale = 1;
		for (let [id, entity] of region) {
		  	if(entity.name === "DIE_SNAKE"){
		  		let len = distance2(entity, _headPos);
		  		if(len < _viewRange && (minLength == 0 || len < minLength)){
		  			force = new Point();
		  			force.x = entity.x - _headPos.x; 
		  			force.y = entity.y - _headPos.y;
		  			minLength = len;
		  		}
		  	}
		}

		if(force !== null){
			//console.log("find die body", force);
			RotateTo(force);
			_curSpeedScale = 2;
			return;
		}

		// random move
		if( _normalAIDirDelta < 0 ) {
			//console.log("random move");
			_normalAIDirDelta = Math.random() * 5000;

			let x = Math.random() * 2-1 + _dir.x;
			let y = Math.random() * 2-1 + _dir.y;

			RotateTo( new Point( x, y ) );
			return;
		}
	}

	function normalize(vec){
		let mod = Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y,2));
		vec.x /= mod;
		vec.y /= mod;
		return vec;
	}

	function RotateTo(vec){
		_aimDir = normalize(vec)
		_tobe = _aimDir.y * _dir.x - _aimDir.x * _dir.y >=0 ? 1: -1;
		//console.log(_tobe>0);
	}

	init();

	return {
		get ID(){
			return _id;
		},
		update: function(dt){
			if(CheckDie()) return;
			if(AI) UpdateNormalAI(dt);
			Rotate(dt);
			Move(dt);
			checkCrumb();
			updateLength();
		},
		setAccelarate: function(value){
		//	console.log("accelerate:" + value)
			if(value)
				changeSpeedScale(2);
			else
				changeSpeedScale(1);
		},
		RotateTo: function(vec){
			_aimDir = vec;
			_tobe = _aimDir.y * _dir.x - _aimDir.x * _dir.y >=0 ? 1: -1;
			//console.log(_tobe>0);
		},
		sentenceDie: function(){	
			_isDead = true;
		},
		get Pos(){
			return _headPos;
		},
		kill(){
			_kill++;
		},
		get Kill(){
			return _kill
		},
		get Title(){
			return _name;
		},
		get Score(){
			return _score;
		},
		get IsDead(){
			return _isDead;
		}
	}
}

module.exports = Snake;
