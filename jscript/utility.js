var game = this.game || (this.game = {});
var createjs = createjs || {};

;(function(game, cjs){
	game.utility = game.helper || {};
	game.utility.resizeCanvas = function(){
		game.canvas.width = window.innerWidth;
		game.canvas.height = window.innerHeight;
	};
	game.utility.approximateCompare = function(a, b, measure){
		return Math.abs(a-b) > measure;
	};
	game.utility.toRadian = function(angle){
		return angle/180*Math.PI;
	};
	game.utility.getRandomHex = function(range){
		return new Number(Math.round(Math.random()*range)).toString(16);
	};
	game.utility.getRandomColor = function(){
		var R = game.utility.getRandomHex(255),
			G = game.utility.getRandomHex(255),
			B = game.utility.getRandomHex(255);
		return "#" + R + G + B;
	}
	game.utility.encode = function(x, y){
		return "_"+x+","+y;
	}
	game.utility.decode = function(code){
		return /_(\d+),(\d+)/.exec(code);
	}
	game.utility.detectCollision = function(obj1, obj2){
		if (!obj1 || !obj2) {
			return false;
		};
		if (!(typeof obj1.getBounds == 'function' && typeof obj2.getBounds == 'function')) {
			return false;
		}
		var bound1 = obj1.getBounds(),
			bound2 = obj2.getBounds(),
			x1 = obj1.x, y1 = obj1.y, 
			w1 = bound1.width * obj1.scaleX,
			h1 = bound1.height * obj1.scaleY,

			x2 = obj2.x, y2 = obj2.y, 
			w2 = bound2.width * obj2.scaleX,
			h2 = bound2.height * obj2.scaleY;

		if (x1 >= x2 && x1 >= x2 + w2) {  
            return false;  
        } else if (x1 <= x2 && x1 + w1 <= x2) {  
            return false;  
        } else if (y1 >= y2 && y1 >= y2 + h2) {  
            return false;  
        } else if (y1 <= y2 && y1 + h1 <= y2) {  
            return false;  
        }  
        return true;  
	};


    
}).call(window, game, createjs);