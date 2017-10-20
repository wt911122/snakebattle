"use strict";
const createjs = require("easeljs");require("tweenjs");
const traditions = require("./tradition.js").crumbs;

const sprite = {};
class Map extends createjs.Container{
	constructor({x, y, width, height} = {}){
		super();
		let rect = new createjs.Shape(),
			step = 40,
			w = width, 
			h = height,
			gr = rect.graphics;

		gr.beginStroke('#ddd');
		for(let i = step; i < w; i += step){
			gr.moveTo(i, 0);
			gr.lineTo(i, h);
		}
		for(let i = step; i < h; i += step){
			gr.moveTo(0, i);
			gr.lineTo(w, i);
		}
		gr.endStroke();

		gr.beginStroke("#000");
		gr.setStrokeStyle(4);
		gr.drawRect(0, 0, w, h);
		gr.endStroke();

		this.name = "MAP"
		this.x = x;
		this.y = y;
		this.addChild(rect);
	}
}

class Crumb extends createjs.Container{
	constructor(color, radius){
		super();
		this.foreGround = color;
		this.foreradius = radius;
		this.drawBody();
		this.name = "CRUMB"
		this.text = traditions[parseInt(traditions.length * Math.random())];
		this.drawText();
	}

	drawBody(){
		let circle = new createjs.Shape();
		let color = this.foreGround;
		circle.graphics.beginFill(color).drawCircle(0, 0, this.foreradius || 6).endFill();
		circle.x = 0;
		circle.y = 0;
		this.addChild(circle);
		this.setBounds(-6,-6, 12, 12);
	}

	drawText() {
		var text = new createjs.Text(this.text, "24px Arial", "#ff7700");
 		text.x = -text.getMeasuredWidth() / 2;
 		text.y = -28;
 		text.textBaseline = "alphabetic";
 		this.addChild(text);
	}

	setForeGround(color){
		this.foreGround = color;
		this.removeAllChildren();
		this.drawBody();
	}
}

class SnakeNode extends createjs.Container{
	constructor(color, user){
		super();
		this.foreGround = color;
		this.drawBody();
		if(user) this.drawName(user);
		this.name = "SNAKE_NODE"
	}

	drawBody(){
		let circle = new createjs.Shape();
		let color = this.foreGround;
		circle.graphics.beginFill(color).drawCircle(0, 0, 20).endFill();
		

		this.addChild(circle);
		this.setBounds(-20,-20, 40, 40);
	}

	drawName(user){
		var text = new createjs.Text(user, "32px Arial", "#ff7700");
 		text.x = -text.getMeasuredWidth() / 2;
 		text.y = -28;
 		text.textBaseline = "alphabetic";
 		this.addChild(text);
	}

	setForeGround(color){
		this.foreGround = color;
		this.removeAllChildren();
		this.drawBody();
	}
}

sprite.map = Map;
sprite.crumb = Crumb;
sprite.snakenode = SnakeNode;
module.exports = sprite;