var game = this.game || {};
var createjs = this.createjs || {};

(function(game, cjs){

	game.quirkCrumbs = {
		enlarge: function(){
			var sprite = new game.sprite.crumb("#ff0000", 8, '#000');
			return {
				sprite: sprite, 
				eaten: false,
				score: 0,
				consequence: function(){
					console.log("changing!")
					var itr = this.TAIL(),
						part;

					while(itr.hasNext()){
						part = itr.next();
						//console.log(part)
						part.scaleX = part.scaleY = 1.5;
					}
					this.HEAD.scaleX = this.HEAD.scaleY = 1.5;
					this.MODE = "enlarge";
				},
				deconsequence: function(){
					console.log("back to normal")
					var itr = this.TAIL(),
						part;
					while(itr.hasNext()){
						part = itr.next();
						part.scaleX = part.scaleY = 1;
					}
					this.HEAD.scaleX = this.HEAD.scaleY = 1;
					this.MODE = "normal";
				}
			}
		},

		broadRange: function(){
			var sprite = new game.sprite.crumb("#000", 8, '#ff0000');
			return{
				sprite: sprite,
				eaten: false,
				score: 0,
				consequence: function(){
					this.HEAD.scaleX = this.HEAD.scaleY = 2;
					this.MODE = "broadRange";
				},
				deconsequence: function(){
					this.HEAD.scaleX = this.HEAD.scaleY = 1;
					this.MODE = "normal";
				}
			}
		}
	}


	game.quirkCrumbsFactory = {
		generate: function(){
			var r = Math.random();
			if(r < 0.5)
				return game.quirkCrumbs.enlarge();
			else 
				return game.quirkCrumbs.broadRange();

		}
	}


}).call(this, game, createjs);