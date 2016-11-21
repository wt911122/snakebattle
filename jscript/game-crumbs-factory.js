var game = this.game || {};
var createjs = this.createjs || {};

(function(game, cjs){


	game.crumbsFactory = {
		generate: function(){
			var r = Math.random();
			if(r < 1)
				return game.crumb.enlarge();

		}
	}
	game.crumb = {};
	game.crumb.normal = function(){
		var sprite = new game.sprite.crumb();
		return {
			sprite: sprite,
			eaten: false,
			score: 1
		}
	}
	game.crumb.enlarge = function(){
		var sprite = new game.sprite.crumb("#ff0000", 8);
		return {
			sprite: sprite, 
			eaten: false,
			score: 1,
			consequence: function(){
				if(!this.cachedSnake.enlarge){
					var tail = [];
					for(var i=this.snakeLength-1; i>-1  ;i--){
						var body = new game.sprite.snake_tail(this.color, 20);
						body.visible = false;
						this.ground.addChild(body);
						tail.push(body);
					}
					var head = new game.sprite.snake_head(this.color, 20);
					head.visible = false;
					this.ground.addChild(head);
					this.cachedSnake.enlarge = {
						head: head,
						tail: tail
					}
				}
				var self = this;
				changemode.call(this, this.cachedSnake.enlarge);
				
				/*if(this.timer){

				}*/

				function changemode(mode){
					console.log(this);
					this._head.visible = false;
					this._tail.forEach(function(part){
						part.visible = false;
					});
					this._head = mode.head;
					this._tail = mode.tail
					this._head.visible = true;
					this._tail.forEach(function(part){
						part.visible = true;
					});
				}
			}
		}
	}


}).call(this, game, createjs);