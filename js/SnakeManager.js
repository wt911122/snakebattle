"use strict";
require("babel-polyfill");
const createjs = require("easeljs");require("tweenjs");
const Setting = require("./Setting");
const Util = require("./Util");
const MapManager = require("./MapManager");
const Snake = require("./Snake");
const ListManager = require("./ListManager");
var names = require("./name.js");

const getRandomColor = Util.getRandomColor;
const Point = createjs.Point;

const SNAKE_MAX_NUM = Setting.ENEMY_SNAKE + 1;
const SNAKE_UPDATE_INTERVAL = 500;
const PLAYGROUND_WIDTH = Setting.PLAYGROUND_WIDTH;
const PLAYGROUND_HEIGHT = Setting.PLAYGROUND_HEIGHT;

let _snakes = new Map();
let _parent,
	_player,
	_snakeCheckDelta = 0;

class SnakeManager{
	constructor(){}

	init(parent){
		let angle = Math.random()*Math.PI*2;
		
		_parent = parent;
		_player = this.createSnake(
			new Point(Setting.PLAYGROUND_WIDTH/2, Setting.PLAYGROUND_HEIGHT/2),
			new Point(Math.cos(angle), Math.sin(angle)),
			Setting.PLAYER_INIT_LENGTH,
			getRandomColor(),
			false,
			_parent,
			"player", this);
		let np = Math.floor(Math.random() * (names.length - Setting.ENEMY_SNAKE - 1)),
			inp = np;
		for(let i = 0; i<Setting.ENEMY_SNAKE; i++){
			angle = Math.random()*Math.PI*2;
			let s = this.createSnake(
				new Point(Math.random()*(Setting.PLAYGROUND_WIDTH - 600)+300, Math.random()*(Setting.PLAYGROUND_HEIGHT - 600)+300),
				new Point(Math.cos(angle), Math.sin(angle)),
				Math.floor(Math.random()*50),
				getRandomColor(),
				true,
				_parent,
				names[inp++], this);
		}
		names.splice(np, Setting.ENEMY_SNAKE);
		//console.log(_snakes);
		return _player;
	}

	getSnake(id){
		return _snakes.get(id);
	}

	createSnake(pos, dir, length, color, AI, stage){
		let entity = Snake.apply(Snake, Array.prototype.slice.call(arguments));
		_snakes.set(entity.ID, entity);
		return entity;
	}

	generateList(){
		let list = []
		for (let entity of _snakes.values()) {
			list.push({
				name: entity.Title,
				score: entity.Score
			})
		}
		list.sort(function(a, b){
			return b.score - a.score
		});
		return list;
	}

	update(dt, overCallback, context){
		if(_player.IsDead) overCallback.call(context, _player.Score, _player.Kill);
		for (var [id, entity] of _snakes) {
			if(entity.IsDead && id !== _player.id){
				_snakes.delete(id);
				names.push(entity.Title);
				ListManager(this.generateList());
			}
		  	entity.update(dt);
		}
		
		_snakeCheckDelta += dt;
		if(_snakeCheckDelta > SNAKE_UPDATE_INTERVAL){
			_snakeCheckDelta -= SNAKE_UPDATE_INTERVAL;
			let need = SNAKE_MAX_NUM - _snakes.size;
			//console.log(`create ${need} snakes`);
			for(let i = 0; i < need; i++){
				let tidx = Math.floor(Math.random() * (names.length-1));
				let angle = Math.random()*Math.PI*2;
				let s = this.createSnake(
					new Point(Math.random()*(PLAYGROUND_WIDTH - 600)+300, Math.random()*(PLAYGROUND_HEIGHT - 600)+300),
					new Point(Math.cos(angle), Math.sin(angle)),
					Math.floor(Math.random()*24),
					getRandomColor(),
					true,
					_parent, names[tidx], this);
				names.splice(tidx, 1);
			}

			ListManager(this.generateList());
		}
		

	}
	clear(){
		_snakes = new Map();
		_player = null;
		_parent = null;
		_snakeCheckDelta = 0;
		names = require("./name.js")
	}
}

module.exports = new SnakeManager();