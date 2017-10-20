"use strict";
const createjs = require("easeljs");require("tweenjs");

const Setting = require("./Setting");
const CrumbSprite = require("./Sprite").crumb;
const Util = require("./Util");
const MapManager = require("./MapManager");

const CRUMB_MAX_NUM = Setting.CRUMB_MAX_NUM;
const PLAYGROUND_WIDTH = Setting.PLAYGROUND_WIDTH;
const PLAYGROUND_HEIGHT = Setting.PLAYGROUND_HEIGHT;
const CRUMB_UPDATE_INTERVAL = 500;
const getRandomColor = Util.getRandomColor;


let crumbs = new Map();
let _parent;
let _crumbUpdateDelta = 0;
class CrumbManager{
	constructor(){}
	
	init(parent){
		_parent = parent;
	//	console.log(stage)
		for(let i = 0; i < CRUMB_MAX_NUM; i++){
			this.addCrumb({});
		}
	}

	addCrumb({x, y, r, color, score, name}){
	//	console.log(x,y,r,color)
		let entity = new CrumbSprite(color || getRandomColor(), r);
		entity.x = x !== undefined ? x : Math.round(Math.random()*(PLAYGROUND_WIDTH-20)) + 10;
		entity.y = y !== undefined ? y : Math.round(Math.random()*(PLAYGROUND_HEIGHT-20)) + 10;
		entity.score = score || 1;
		if(name) entity.name = name;
		_parent.addChild(entity);
		crumbs.set(entity.id, entity);
		MapManager.AddToABlock(entity);
	}

	deleteCrumb(entity, pos){
		createjs.Tween.get(entity).to({x:pos.x, y: pos.y}, 100).call(()=>{
			MapManager.RemoveFromABlock(entity);
			_parent.removeChild(entity);
			crumbs.delete(entity.id);
		});
		//entity.uncache();
	}

	update(dt){
		_crumbUpdateDelta += dt;
		if(_crumbUpdateDelta > CRUMB_UPDATE_INTERVAL){
			_crumbUpdateDelta -= CRUMB_UPDATE_INTERVAL;
			//console.log(crumbs.size)
			let span = CRUMB_MAX_NUM - crumbs.size;
			//console.log(`add ${span} crumb`);
			for(; span>=0;span--){
				this.addCrumb({});
			}
		}
	}

	clear(){
		crumbs = new Map();
		_parent = null;
		_crumbUpdateDelta = 0;
	}
}

module.exports = new CrumbManager();