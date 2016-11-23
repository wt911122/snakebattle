var game = this.game || {};

;(function(game){
	game.PI2 = Math.PI*2;
	game.canvas = document.getElementById('stage');
	game.touchHandlerDom = document.getElementById('motionhandler');
	game.velocityHandleDom = document.getElementById('velocityHandler');
	game.touchHandlerBtn = game.touchHandlerDom.querySelector("button.MotionControler");
	var	bt = game.touchHandlerBtn.getBoundingClientRect();
	game.touchHandlerCenter = {
		x: bt.left + bt.width/2,
		y: bt.top + bt.height/2
	}

	game.utility.resizeCanvas();

	game.setting = {
		gameWidth: game.canvas.width,
		gameHeight: game.canvas.height,
		
		netWidth: 10,
		detectRange: 2,
		crumbRefresh: 3000,
		crumbRadius: 5,

		snakeRadius: 8,
		snakeSpinLength: 0.3, 
		snakeBodySpan: 16, 			// px
		initialSnakeVelocity: 0.16, // px/ms 
		advancedSnakeVelocity: 0.22, 
		initialSnakelength: 5,
		pointsToGrow: 3,

		playgroundWidth: 2000,
		crumbsNum: 200,
		enemyNum: 5,

		AIDangerBounding: 30,
		AIComfortBounding: 100,

		quirkModeRefresher: 1000,

	}
}).call(this, game);