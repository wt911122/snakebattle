var game = this.game || {};
var createjs = this.createjs || {};

;(function(){
	game.keyHandler = {
		init: function(){
			window.addEventListener("keydown", function(event){
				if (event.defaultPrevented) {
					return; // Should do nothing if the key event was already consumed.
				}
				switch (event.key) {
					case "ArrowDown":
						//console.log("down")
						game.playground.player.DIRECTION = 90
						break;
					case "ArrowUp":
						//console.log("up")
						game.playground.player.DIRECTION = 270
						break;
					case "ArrowLeft":
						//console.log("left")
						game.playground.player.DIRECTION = 180
						break;
					case "ArrowRight":
						//console.log("right")
						game.playground.player.DIRECTION = 0
						break;

					default:
						return; // Quit when this doesn't handle the key event.
				}
			})
		}
	}
}).call(this, game);

;(function(){
	var touchHandler = function(evt){
		evt.stopPropagation();
		evt.preventDefault();
		if (evt.touches.length > 1 || (evt.type == "touchend" && evt.touches.length > 0))
			return;
		var touch = evt.changedTouches[0];
		var x = touch.clientX, 
			y = touch.clientY; 
		game.playground.player.turnTo(transCoord(x, y));
	}
	game.touchHandler = {
		init: function(){
			game.touchHandlerDom.addEventListener("touchstart", touchHandler);
			game.touchHandlerDom.addEventListener("touchmove", touchHandler);
			game.touchHandlerDom.addEventListener("touchend", function(){
				backCoord();
			});
		},
	}
	function transCoord(x, y){
		var deltaX = x - game.touchHandlerCenter.x,
			deltaY = y - game.touchHandlerCenter.y,
			theta = Math.atan(deltaY/deltaX);
		theta = Math.round(theta/Math.PI*180);
		if(deltaX < 0){
			theta += 180;
		}else{
			if(deltaY < 0){
				theta = 360 + theta;
			}
		}
		var left = 13 * Math.cos(theta/180*Math.PI),
			top =  13 * Math.sin(theta/180*Math.PI);
			//console.log(left, top);
		game.touchHandlerBtn.style.transform = "translate("+left+"px,"+top+"px)";
		return theta;
	}
	function backCoord(){
		game.touchHandlerBtn.style.transform = "translate(0px,0px)";
	}
}).call(this, game);


;(function(game, cjs){
	game.gameView = {
		init: function(){
			cjs.Ticker.timingMode = createjs.Ticker.RAF;
		//	cjs.Ticker.useRAF = true;

			cjs.Ticker.addEventListener("tick", game.playground.tick.bind(game.playground));
			
			cjs.Ticker.addEventListener("tick", game.stage);
		}
	}
}).call(this, game, createjs);


;(function(game, cjs){
	game.start = function(){
		game.stage = new cjs.Stage(game.canvas);
		cjs.Touch.enable(game.stage);
		var initAll = function(){
			game.keyHandler.init();
			game.touchHandler.init();
			game.playground.init();
			//game.gameView.init();
		}
		initAll();
	}
}).call(this, game, createjs);

;(function(game){
	if (game){
		game.start();
	}else{
		throw "No logic Found";
	}
}).call(this, game)

