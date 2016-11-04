var game = this.game || {};
var createjs = this.createjs || {};

;(function(game){
	game.PI2 = Math.PI*2;
	game.canvas = document.getElementById('stage');
	game.utility.resizeCanvas();
	game.setting = {
		FPS: 40,

		gameWidth: game.canvas.width,
		gameHeight: game.canvas.height,

		snakeRadius: 8,
		snakeVelocity: 50, // 50像素每秒
		snakeSpinRadius: 14, 
		snakelength: 5,
		snakeTailSpan: 12,

		playgroundWidth: 400,
		crumbsNum: 40,

	}
}).call(this, game);

;(function(){
	game.keyHandler = {
		init: function(){
			window.addEventListener("keydown", function(event){
				if (event.defaultPrevented) {
					return; // Should do nothing if the key event was already consumed.
				}
				switch (event.key) {
					case "ArrowDown":
						console.log("down")
						game.motion.setToDirection(Math.PI * 0.5);
						break;
					case "ArrowUp":
						console.log("up")
						game.motion.setToDirection(Math.PI * 1.5);
						break;
					case "ArrowLeft":
						console.log("left")
						game.motion.setToDirection(Math.PI);
						break;
					case "ArrowRight":
						console.log("right")
						game.motion.setToDirection(0);
						break;
					default:
						return; // Quit when this doesn't handle the key event.
				}
			})
		}
	}
}).call(this, game)

;(function(game, cjs){
	game.motion = {
		init: function(){
			this.direction = 2 * Math.PI* Math.random();	
			this.toDirection = this.direction;
			this.angleSpanAnimate = -1;
		},
		setToDirection: function(angle){
			this.toDirection = angle;
		
			var temp = this.toDirection - this.direction;

			if(temp > Math.PI)
				this.angleSpan = temp - game.PI2;
			else if(temp < -Math.PI)
				this.angleSpan = game.PI2 - Math.abs(temp);
			else 
				this.angleSpan = temp;


			this.angleSpanAnimate = Math.abs(this.angleSpan)
			
			this.timetochange = game.setting.snakeSpinRadius * Math.abs(this.angleSpan) / game.setting.snakeVelocity;
		},
		getInverse: function() {
			var angle = this.direction +  Math.PI
			return  angle > 2 * Math.PI ? angle - 2 * Math.PI: angle;
		},
		change: function(delta){
			var temp = this.direction + delta;
			if(temp < 0)
				temp += game.PI2;
			if(temp > game.PI2)
				temp -= game.PI2;
			this.direction = temp
		}
	}

	game.playground = {
		init: function(){
			var sprite = this.sprite = new game.sprite.playground({
				x: game.setting.gameWidth/2, 
				y: game.setting.gameHeight/2, 
				width: game.setting.playgroundWidth,
				height: game.setting.playgroundWidth
			});

			game.stage.addChild(sprite);
		}, 
		tick: function(event){
			if(!cjs.Ticker.paused){
				var deltaS = event.delta / 1000,
					motion = game.motion,
					span = game.setting.snakeVelocity * deltaS,
					angle = motion.getInverse(),
					deltaX = span * Math.cos(angle),
					deltaY = span * Math.sin(angle);
					this.sprite.x += deltaX;
					this.sprite.y += deltaY;

				if(motion.angleSpanAnimate > 0){
					// todo 有一些问题
					console.log(motion.angleSpanAnimate * 180)
					var deltaTheta = deltaS / motion.timetochange * motion.angleSpan;
					motion.change(deltaTheta);
					motion.angleSpanAnimate -= Math.abs(deltaTheta);
				}else{
					motion.direction = motion.toDirection;
				}
			}
		}
	}

	game.snake = {
		tail: [],
		init: function(){
			var head = this.head = new game.sprite.snake_head({
				x: game.setting.gameWidth/2, 
				y: game.setting.gameHeight/2, 
			});
			game.stage.addChild(head);
			for (var i = game.setting.snakelength; i >= 0; i--) {
				this.tail.push(new game.sprite.snake_tail({
					x: game.setting.gameWidth/2, 
					y: game.setting.gameHeight/2, 
				}))
			}
		},
		tick: function(){

		}
	}
}).call(window, game, createjs);

;(function(game, cjs){
	game.gameView = {
		init: function(){
			cjs.Ticker.timingMode = createjs.Ticker.RAF;
			cjs.Ticker.setFPS(game.setting.FPS);

			cjs.Ticker.addEventListener("tick", game.playground.tick.bind(game.playground));
			
			cjs.Ticker.addEventListener("tick", game.stage);
		}
	}
}).call(this, game, createjs);

;(function(game, cjs){
	game.initLoader = function(complete){
		/*manifest = [
			{src: "aircraft.png", id: "aircraft"},
			{src: "enemy1.png", id: "enemy1"},
			{src: "enemy2.png", id: "enemy2"},
			{src: "enemy3.png", id: "enemy3"},
			{src: "shoot/bullet1.png", id: "heroBullet"},
			{src: "shoot/bullet2.png", id: "enemyBullet"},
			{src: "shoot/bomb.png", id: "bombRepository"},
			{src: "shoot/ufo1.png", id: "ufo1"},
			{src: "shoot/ufo2.png", id: "ufo2"},
			{src: "background.png", id: "background"},
			{src: "shoot/bomb.png", id: "bomb"},
			{src: "shoot/game_pause_nor.png", id: "pause"},
			{src: "shoot/game_resume_nor.png", id: "resume"}
		];
		game.loader = new cjs.LoadQueue(false);
		game.loader.addEventListener("complete", complete);
		game.loader.loadManifest(manifest, true, "imgs/");*/
		complete();
	}
}).call(this, game, createjs);

;(function(game, cjs){
	game.start = function(){
		game.stage = new cjs.Stage(game.canvas);
		cjs.Touch.enable(game.stage);
		var handleComplete = function(){
			game.motion.init();
			game.playground.init();
			game.snake.init();
			game.keyHandler.init();
			game.gameView.init();
		}
		game.initLoader(handleComplete);
	}
}).call(this, game, createjs);

;(function(game){
	if (game){
		game.start();
	}else{
		throw "No logic Found";
	}
}).call(this, game)