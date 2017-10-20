"use strict";
require("babel-polyfill");
const Setting = require("./Setting");

const MAP_BLOCK_WIDTH = Setting.MAP_BLOCK_WIDTH;

let regions = [],
	stepR, stepC;
class MapManager {
	constructor(){
		stepC = Setting.PLAYGROUND_WIDTH >> Setting.MAP_BLOCK_WIDTH;
		stepR = Setting.PLAYGROUND_HEIGHT >> Setting.MAP_BLOCK_WIDTH;

		for(let r = 0; r <= stepR; r++){
			regions[r] = [];
			for(let c = 0; c<= stepC; c++){
				regions[r][c] = new Map();
			}
		}
		console.log(stepC, stepR);
	}

	AddToABlock(entity){
		let	c = entity.x >> MAP_BLOCK_WIDTH,
			r = entity.y >> MAP_BLOCK_WIDTH;
		try{
			regions[r][c].set(entity.id, entity);
		}catch(e){
			console.error(c, r);
		}
	}

	RemoveFromABlock(entity){
		let	c = entity.x >> MAP_BLOCK_WIDTH,
			r = entity.y >> MAP_BLOCK_WIDTH;
		regions[r][c].delete(entity.id);
	}

	getRegion(pos){
		let	c = pos.x >> MAP_BLOCK_WIDTH,
			r = pos.y >> MAP_BLOCK_WIDTH;
		return regions[r][c];
	}
	RefreshBlock(entity, pos){
		let	cbefore = entity.x >> MAP_BLOCK_WIDTH,
			rbefore = entity.y >> MAP_BLOCK_WIDTH,
			cafter = pos.x >> MAP_BLOCK_WIDTH,
			rafter = pos.y >> MAP_BLOCK_WIDTH;
		if(cbefore !== cafter || rbefore !== rafter){
			regions[rbefore][cbefore].delete(entity.id);
			regions[rafter][cafter].set(entity.id, entity);
		}

	}

	clear(){
		for(let r = 0; r <= stepR; r++){
			regions[r] = [];
			for(let c = 0; c<= stepC; c++){
				regions[r][c] = new Map();
			}
		}
	}
}	

module.exports = new MapManager();