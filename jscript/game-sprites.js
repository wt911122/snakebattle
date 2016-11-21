var game = this.game || {};
var createjs = this.createjs || {};
/**
	game.sprite namespace
**/
(function(game, cjs){
	game.sprite = {};

	;(game.sprite.snake_head = function(color, radius){
		cjs.Container.call(this);
		var circle = new cjs.Shape();
		circle.graphics.beginStroke('#000000');
		circle.graphics.beginFill(color).drawCircle(0, 0, radius||game.setting.snakeRadius);
		circle.graphics.moveTo(0,0);
		circle.graphics.lineTo(12, 0);
		circle.graphics.endStroke();
		circle.graphics.endFill();
		circle.x = 0;
		circle.y = 0;

		this.addChild(circle);
	}).prototype = Object.create(cjs.Container.prototype);

	;(game.sprite.snake_tail = function(color, radius){
		cjs.Container.call(this);
		var circle = new cjs.Shape();
		//circle.graphics.beginStroke('#000000');
		circle.graphics.beginFill(color).drawCircle(0, 0, radius||game.setting.snakeRadius);
		//circle.graphics.endStroke();
		circle.graphics.endFill();
		circle.x = 0;
		circle.y = 0;
		this.addChild(circle);
	}).prototype = Object.create(cjs.Container.prototype);

	/*;(game.sprite.snake_candy = function(){
		cjs.Container.call(this);
		var circle = new cjs.Shape();
		circle.graphics.beginFill("#0000FF").drawCircle(0, 0, 7);
		circle.graphics.endFill();
		circle.x = 0;
		circle.y = 0;
		this.addChild(circle);
	}).prototype = Object.create(cjs.Container.prototype);*/

	;(game.sprite.playground = function(bound){
		cjs.Container.call(this);
		var rect = new cjs.Shape();
		var step = 20;
		rect.graphics.beginStroke('#ddd');
		for(var i = step; i < bound.width; i += step){
			rect.graphics.moveTo(i, 0);
			rect.graphics.lineTo(i, bound.height);
		}
		for(var i = step; i < bound.height; i += step){
			rect.graphics.moveTo(0, i);
			rect.graphics.lineTo(bound.width, i);
		}
		rect.graphics.endStroke();

		rect.graphics.beginStroke("#000");
		rect.graphics.setStrokeStyle(2);
		rect.graphics.drawRect(0, 0, bound.width, bound.height);
		rect.graphics.endStroke();
		this.x = bound.x;
		this.y = bound.y;
		this.addChild(rect);
	}).prototype = Object.create(cjs.Container.prototype);

	;(game.sprite.crumb = function(color, radius){
		cjs.Container.call(this);
		var circle = new cjs.Shape();
		var R = game.utility.getRandomHex(255),
			G = game.utility.getRandomHex(255),
			B = game.utility.getRandomHex(255);
		var color = color || "#" + R + G + B;
		circle.graphics.beginFill(color).drawCircle(0, 0, radius||game.setting.crumbRadius);
		circle.graphics.endStroke();
		circle.x = 0;
		circle.y = 0;
		this.addChild(circle);
	}).prototype = Object.create(cjs.Container.prototype)

}).call(window, game, createjs)